import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Check for subdomain routing
  const hostname = req.headers.get("host") || "";
  const isLocalhost = hostname.includes("localhost");

  // Extract subdomain (e.g., "myserver" from "myserver.minesites.net")
  let subdomain: string | null = null;
  if (!isLocalhost) {
    const parts = hostname.split(".");
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // Rewrite subdomain requests to /[subdomain] route
  if (subdomain && subdomain !== "www") {
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
