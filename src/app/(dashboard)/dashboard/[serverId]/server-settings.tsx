"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { updateServerSchema, type UpdateServerInput } from "@/lib/validations/server";
import { updateServer } from "../actions";
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
  } = useForm<UpdateServerInput>({
    resolver: zodResolver(updateServerSchema),
    defaultValues: {
      name: server.name,
      subdomain: server.subdomain,
      description: server.description || "",
      serverIp: server.serverIp || "",
      serverPort: server.serverPort || 25565,
    },
  });

  const onSubmit = async (data: UpdateServerInput) => {
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, String(value));
        }
      });
      await updateServer(server.id, formData);
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

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Server IP
            </label>
            <Input {...register("serverIp")} error={!!errors.serverIp} />
            {errors.serverIp && (
              <p className="text-sm text-red-500 mt-1">{errors.serverIp.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Server Port
            </label>
            <Input
              type="number"
              {...register("serverPort")}
              error={!!errors.serverPort}
            />
            {errors.serverPort && (
              <p className="text-sm text-red-500 mt-1">{errors.serverPort.message}</p>
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
