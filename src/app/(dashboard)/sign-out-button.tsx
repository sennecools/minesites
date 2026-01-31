"use client";

import { signOut } from "next-auth/react";
import { DropdownItem } from "@/components/ui";

export function SignOutButton() {
  return (
    <DropdownItem onClick={() => signOut({ callbackUrl: "/" })} destructive>
      Sign out
    </DropdownItem>
  );
}
