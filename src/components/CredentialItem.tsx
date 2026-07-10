"use client";

import { useState } from "react";
import { DeleteButton } from "./DeleteButton";

type Credential = {
  id: string;
  label: string;
  url: string | null;
  username: string | null;
  password: string | null;
  notes: string | null;
};

function Copy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="text-xs text-[var(--primary)] hover:underline"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function CredentialItem({
  credential,
  onDelete,
}: {
  credential: Credential;
  onDelete: () => void;
}) {
  const [show, setShow] = useState(false);
  const c = credential;

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-medium">{c.label}</div>
          {c.url && (
            <a
              href={c.url.startsWith("http") ? c.url : `https://${c.url}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              {c.url}
            </a>
          )}
          <div className="mt-2 space-y-1 text-sm">
            {c.username && (
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted)]">User:</span>
                <span className="font-mono">{c.username}</span>
                <Copy value={c.username} />
              </div>
            )}
            {c.password && (
              <div className="flex items-center gap-2">
                <span className="text-[var(--muted)]">Pass:</span>
                <span className="font-mono">
                  {show ? c.password : "••••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  {show ? "Hide" : "Show"}
                </button>
                <Copy value={c.password} />
              </div>
            )}
            {c.notes && (
              <div className="text-[var(--muted)]">{c.notes}</div>
            )}
          </div>
        </div>
        <DeleteButton
          action={onDelete}
          confirm={`Delete “${c.label}”?`}
          label="✕"
          className="text-[var(--muted)] hover:text-red-600 text-sm"
        />
      </div>
    </div>
  );
}
