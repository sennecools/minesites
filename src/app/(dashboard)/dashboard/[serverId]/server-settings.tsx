"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { updateWebsiteSchema, type UpdateWebsiteInput } from "@/lib/validations/website";
import { updateWebsite } from "../actions";
import { useState } from "react";

interface Server {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  serverIp: string | null;
  serverPort: number | null;
}

interface ServerSettingsProps {
  server: Server;
}

export function ServerSettings({ server }: ServerSettingsProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateWebsiteInput>({
    resolver: zodResolver(updateWebsiteSchema),
    defaultValues: {
      name: server.name,
      subdomain: server.subdomain,
      description: server.description || "",
    },
  });

  const onSubmit = async (data: UpdateWebsiteInput) => {
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      // BL-06: always include `description` (even when empty) so the server can
      // distinguish "user wants to clear" (empty string → null) from
      // "field not submitted" (do not change). For other fields, empty strings
      // are stripped so the partial update schema treats them as "do not change".
      Object.entries(data).forEach(([key, value]) => {
        if (key === "description") {
          // Send "" so the server action sees `formData.has("description")` and
          // maps the empty value to null (explicit clear).
          formData.append(key, value === undefined || value === null ? "" : String(value));
        } else if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });
      await updateWebsite(server.id, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-600">
              Settings saved successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Server Name
            </label>
            <Input {...register("name")} error={!!errors.name} />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Subdomain
            </label>
            <div className="flex items-center">
              <Input
                {...register("subdomain")}
                error={!!errors.subdomain}
                className="rounded-r-none"
              />
              <span className="px-3 py-2.5 text-sm text-zinc-500 bg-zinc-100 border border-l-0 border-zinc-200 rounded-r-xl">
                .minesites.net
              </span>
            </div>
            {errors.subdomain && (
              <p className="text-sm text-red-500 mt-1">{errors.subdomain.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Description
            </label>
            <Textarea {...register("description")} rows={3} error={!!errors.description} />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
