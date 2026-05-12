"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  createMcserverSchema,
  type CreateMcserverInput,
} from "@/lib/validations/mcserver";
import { Server, Loader2, Pencil, Trash2, Plus, X } from "lucide-react";

// Mirror the Phase 7 endpoint response shape for /api/websites/[websiteId]/servers
// (and its [serverId] sibling) — Prisma applies @default(25565) at write time, so
// `port` is always a number on the wire. Description is nullable per Phase 6 schema.
interface McServer {
  id: string;
  name: string;
  ip: string;
  port: number;
  description: string | null;
}

type RowMode = "read" | "edit" | "confirm-delete";

interface ConnectionsModalProps {
  websiteId: string;
  isOpen: boolean;
  onClose: () => void;
}

// DASH-03 (D-03) connections manager. Each CRUD action commits independently
// against the Phase-7 per-record REST endpoints — the editor's bulk PUT save
// path is NOT touched.
export function ConnectionsModal({ websiteId, isOpen, onClose }: ConnectionsModalProps) {
  const [servers, setServers] = useState<McServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rowMode, setRowMode] = useState<Record<string, RowMode>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const modeOf = (id: string): RowMode => rowMode[id] ?? "read";
  // Only one row is ever in edit/confirm-delete mode at a time per UI-SPEC §Interaction Contracts.
  const setOnlyRowMode = (id: string, mode: RowMode) => setRowMode({ [id]: mode });
  const exitRowMode = (id: string) =>
    setRowMode((m) => {
      const next = { ...m };
      delete next[id];
      return next;
    });

  // D-02 + RESEARCH Pitfall 2: fetch only when modal opens; cancel in-flight load
  // if the user closes/reopens rapidly during a slow connection.
  useEffect(() => {
    if (!isOpen) {
      // Discard any draft inline state on close so reopen is clean.
      setServers([]);
      setRowMode({});
      setShowAddForm(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/websites/${websiteId}/servers`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load servers");
        }
        const data: McServer[] = await res.json();
        if (!cancelled) setServers(data);
      } catch (err) {
        if (!cancelled) {
          toast(err instanceof Error ? err.message : "Failed to load servers", "error");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, websiteId, toast]);

  // D-03: each handler hits its own Phase-7 endpoint. WR-04 envelope unwrap on
  // every non-OK response — server-side messages surface verbatim via toast.
  const addServer = async (data: CreateMcserverInput) => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/servers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to add server");
      }
      const created: McServer = await res.json();
      setServers((s) => [...s, created]);
      setShowAddForm(false);
      toast("Server added", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add server", "error");
    }
  };

  const updateServer = async (id: string, data: Partial<CreateMcserverInput>) => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/servers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update server");
      }
      const updated: McServer = await res.json();
      setServers((s) => s.map((srv) => (srv.id === id ? updated : srv)));
      exitRowMode(id);
      toast("Server updated", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update server", "error");
    }
  };

  const deleteServer = async (id: string) => {
    try {
      const res = await fetch(`/api/websites/${websiteId}/servers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete server");
      }
      setServers((s) => s.filter((srv) => srv.id !== id));
      exitRowMode(id);
      toast("Server removed", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete server", "error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <ModalHeader className="flex items-center justify-between">
        <ModalTitle>Connected Minecraft Servers</ModalTitle>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </ModalHeader>
      <ModalContent className="max-h-[60vh] overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
            <p className="text-sm text-zinc-500 mt-2">Loading servers...</p>
          </div>
        ) : servers.length === 0 && !showAddForm ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Server className="w-8 h-8 text-zinc-300" />
            <h3 className="text-base font-semibold text-zinc-900 mt-3">
              No servers connected yet
            </h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs">
              Add a Minecraft server to enable Live Player Count and Server Info sections.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="mt-4"
            >
              Add Server
            </Button>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {servers.map((srv) => (
                <ServerRow
                  key={srv.id}
                  server={srv}
                  mode={modeOf(srv.id)}
                  onEdit={() => setOnlyRowMode(srv.id, "edit")}
                  onConfirmDelete={() => setOnlyRowMode(srv.id, "confirm-delete")}
                  onCancel={() => exitRowMode(srv.id)}
                  onUpdate={(data) => updateServer(srv.id, data)}
                  onDelete={() => deleteServer(srv.id)}
                />
              ))}
            </ul>

            {!showAddForm && servers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="mt-4 w-full"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Server
              </Button>
            )}

            {showAddForm && (
              <div className="mt-4 bg-zinc-50 rounded-xl border border-zinc-200 p-4">
                <ServerForm
                  mode="add"
                  onSubmit={addServer}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

interface ServerRowProps {
  server: McServer;
  mode: RowMode;
  onEdit: () => void;
  onConfirmDelete: () => void;
  onCancel: () => void;
  onUpdate: (data: Partial<CreateMcserverInput>) => Promise<void>;
  onDelete: () => Promise<void>;
}

function ServerRow({
  server,
  mode,
  onEdit,
  onConfirmDelete,
  onCancel,
  onUpdate,
  onDelete,
}: ServerRowProps) {
  if (mode === "edit") {
    return (
      <li className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <ServerForm
          mode="edit"
          initial={server}
          onSubmit={onUpdate}
          onCancel={onCancel}
        />
      </li>
    );
  }

  if (mode === "confirm-delete") {
    return (
      <li className="rounded-xl bg-red-50 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-900">
          {`Delete '${server.name}'?`}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-red-500 text-white hover:bg-red-600 rounded-xl"
            onClick={onDelete}
            aria-label={`Confirm delete ${server.name}`}
            autoFocus
          >
            Delete
          </Button>
        </div>
      </li>
    );
  }

  // read mode
  return (
    <li className="rounded-xl px-4 py-3 hover:bg-zinc-50 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-semibold text-zinc-900 truncate">{server.name}</span>
          <span className="font-mono text-xs text-zinc-500 truncate">
            {server.ip}
            {server.port ? `:${server.port}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${server.name}`}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            aria-label={`Delete ${server.name}`}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {server.description && (
        <p className="text-sm text-zinc-500 line-clamp-1 mt-1">{server.description}</p>
      )}
    </li>
  );
}

interface ServerFormProps {
  mode: "add" | "edit";
  initial?: McServer;
  onSubmit: (data: CreateMcserverInput) => Promise<void>;
  onCancel: () => void;
}

function ServerForm({ mode, initial, onSubmit, onCancel }: ServerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateMcserverInput>({
    resolver: zodResolver(createMcserverSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          ip: initial.ip,
          port: initial.port,
          description: initial.description ?? undefined,
        }
      : undefined,
  });

  const handleFormSubmit = async (data: CreateMcserverInput) => {
    await onSubmit(data);
    if (mode === "add") reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-normal text-zinc-700 mb-1.5">Name</label>
          <Input
            {...register("name")}
            placeholder="My SMP Server"
            error={!!errors.name}
            autoFocus
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-normal text-zinc-700 mb-1.5">
            IP / Hostname
          </label>
          <Input
            {...register("ip")}
            placeholder="play.example.net"
            error={!!errors.ip}
          />
          {errors.ip && (
            <p className="text-sm text-red-500 mt-1">{errors.ip.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-normal text-zinc-700 mb-1.5">Port</label>
          <Input
            {...register("port", {
              valueAsNumber: true,
              setValueAs: (v) =>
                v === "" || v === undefined || v === null ? undefined : Number(v),
            })}
            type="number"
            placeholder="25565"
            error={!!errors.port}
          />
          {errors.port && (
            <p className="text-sm text-red-500 mt-1">{errors.port.message}</p>
          )}
        </div>
        <div />
      </div>
      <div>
        <label className="block text-sm font-normal text-zinc-700 mb-1.5">
          Description (optional)
        </label>
        <Textarea
          {...register("description")}
          placeholder="What makes this server special..."
          rows={2}
          error={!!errors.description}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
          {mode === "edit" ? "Update Server" : "Save Server"}
        </Button>
      </div>
    </form>
  );
}
