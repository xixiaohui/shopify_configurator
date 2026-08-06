"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API may not be available (e.g. non-HTTPS)
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded px-2 py-0.5 text-[11px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
      type="button"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
