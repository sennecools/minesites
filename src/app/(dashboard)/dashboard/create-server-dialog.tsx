"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Textarea,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from "@/components/ui";
import { createServerSchema, type CreateServerInput } from "@/lib/validations/server";
import { createServer } from "./actions";

export function CreateServerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateServerInput>({
    resolver: zodResolver(createServerSchema),
  });

  const onSubmit = async (data: CreateServerInput) => {
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      await createServer(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    reset();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Server
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <ModalTitle>Create a new server</ModalTitle>
          </ModalHeader>
          <ModalContent className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Server Name
              </label>
              <Input
                {...register("name")}
                placeholder="My Awesome Server"
                error={!!errors.name}
              />
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
                  placeholder="my-server"
                  error={!!errors.subdomain}
                  className="rounded-r-none"
                />
                <span className="px-3 py-2.5 text-sm text-zinc-500 bg-zinc-100 border border-l-0 border-zinc-200 rounded-r-xl">
                  .mcsite.com
                </span>
              </div>
              {errors.subdomain && (
                <p className="text-sm text-red-500 mt-1">{errors.subdomain.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Description (optional)
              </label>
              <Textarea
                {...register("description")}
                placeholder="Tell players about your server..."
                rows={3}
                error={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Server IP (optional)
              </label>
              <Input
                {...register("serverIp")}
                placeholder="play.myserver.com"
                error={!!errors.serverIp}
              />
              {errors.serverIp && (
                <p className="text-sm text-red-500 mt-1">{errors.serverIp.message}</p>
              )}
            </div>
          </ModalContent>
          <ModalFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Server"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
