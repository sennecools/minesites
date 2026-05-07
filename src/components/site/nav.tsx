"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface SiteNavProps {
  serverName: string;
  serverIp: string;
}

export function SiteNav({ serverName, serverIp }: SiteNavProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(serverIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav
      className="sticky top-0 z-50 h-14 flex items-center justify-between px-6"
      style={{ backgroundColor: "var(--site-card)" }}
    >
      <span
        className="font-bold text-lg"
        style={{
          fontFamily: "var(--site-font-display)",
          color: "var(--site-text)",
        }}
      >
        {serverName}
      </span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{
          backgroundColor: "var(--site-accent)",
          color: "#ffffff",
        }}
        aria-label="Copy server IP"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy IP"}
      </button>
    </nav>
  );
}
