"use client";

import { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from "@/components/ui";
import { togglePublished, deleteServer } from "../actions";

interface ServerActionsProps {
  serverId: string;
  published: boolean;
}

export function ServerActions({ serverId, published }: ServerActionsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTogglePublished = async () => {
    await togglePublished(serverId);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteServer(serverId);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dropdown
        align="right"
        trigger={
          <Button variant="secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Button>
        }
      >
        <DropdownItem onClick={handleTogglePublished}>
          {published ? "Unpublish" : "Publish"}
        </DropdownItem>
        <DropdownDivider />
        <DropdownItem destructive onClick={() => setIsDeleteOpen(true)}>
          Delete Server
        </DropdownItem>
      </Dropdown>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <ModalHeader>
          <ModalTitle>Delete Server</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <p className="text-sm text-zinc-600">
            Are you sure you want to delete this server? This action cannot be undone
            and all your data will be permanently deleted.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-500"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
