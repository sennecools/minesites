// WR-01: shared error→HTTP-response helper for all /api/* route handlers.
// Pattern-matches the common failure modes (Zod validation, Prisma known
// errors) into structured 400/404/409 responses. Falls back to a 500 with the
// caller-supplied fallback message AND `error.message` in a `details` field so
// production 500s carry actionable signal without needing server-log access.

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

interface ApiErrorOptions {
  fallback: string;
  // Optional logging context — surfaces in console.error for debug pipelines.
  context?: string;
}

/**
 * Map a thrown error to the appropriate NextResponse for an API route.
 *
 * - ZodError                                → 400  { error: "Invalid input", details }
 * - Prisma P2002 (unique constraint)         → 409  with target-specific message
 *                                                   (subdomain → "Subdomain is already taken")
 * - Prisma P2025 (record not found)          → 404  { error: "Not found" }
 * - Prisma P2003 (FK constraint violated)    → 409  { error: "Foreign-key conflict" }
 * - Other errors                              → 500  { error: fallback, details: error.message }
 *
 * Notes:
 * - The 500 path deliberately surfaces `error.message` in `details`. The error
 *   classes that carry sensitive info (Prisma known errors) are handled above
 *   this branch, so anything reaching the default is either a generic Error or
 *   an unknown — neither of which should be expected to leak secrets. Adjust
 *   if a future error class needs redaction.
 */
export function apiErrorResponse(
  error: unknown,
  { fallback, context }: ApiErrorOptions
): NextResponse {
  if (context) {
    console.error(`Error in ${context}:`, error);
  } else {
    console.error("API error:", error);
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid input", details: error.flatten() },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = error.meta?.target as string[] | string | undefined;
      const targetStr = Array.isArray(target) ? target.join(",") : target ?? "";
      if (targetStr.includes("subdomain")) {
        return NextResponse.json(
          { error: "Subdomain is already taken" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Conflict on unique constraint", details: targetStr || "unknown" },
        { status: 409 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Foreign-key conflict", details: error.meta?.field_name ?? "" },
        { status: 409 }
      );
    }
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: fallback, details: message }, { status: 500 });
}
