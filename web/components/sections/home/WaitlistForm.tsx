"use client";

import { useId, useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { buttonPrimary } from "@/lib/styles";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

/**
 * Email sign-up that POSTs to a hosted form service (NEXT_PUBLIC_WAITLIST_ENDPOINT,
 * e.g. Formspree). Sends JSON and asks for JSON back, so the visitor stays on the page.
 */
export default function WaitlistForm({ source }: { source: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const inputId = useId();
  const messageId = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    // Honeypot: real visitors never see or fill this field; bots often do.
    if (form.get("company_website")) {
      setStatus({ kind: "success" });
      return;
    }

    if (!site.waitlistEndpoint) {
      setStatus({
        kind: "error",
        message: site.contactEmail
          ? `Sign-ups aren't open yet. Email us at ${site.contactEmail}.`
          : "Sign-ups aren't configured yet. Please check back soon.",
      });
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const response = await fetch(site.waitlistEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: form.get("email"), source }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus({ kind: "success" });
    } catch {
      setStatus({ kind: "error", message: "Something went wrong. Please try again." });
    }
  }

  if (status.kind === "success") {
    return (
      <p role="status" className="border border-line border-l-[5px] border-l-pink bg-page px-5 py-4 text-base text-fg">
        <span>✓</span> You&apos;re on the list. We&apos;ll be in touch when
        early access opens.
      </p>
    );
  }

  const submitting = status.kind === "submitting";

  return (
    <form onSubmit={onSubmit} noValidate={false} className="w-full">
      <label htmlFor={inputId} className="sr-only">
        Work email
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          aria-describedby={status.kind === "error" ? messageId : undefined}
          className="min-h-12 min-w-0 flex-1 border border-fg/50 bg-page/70 px-4 text-base text-fg placeholder:text-muted-fg"
        />
        {/* Honeypot (hidden from people and screen readers) */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={submitting}
          className={`${buttonPrimary} cursor-pointer disabled:cursor-wait disabled:opacity-70`}
        >
          {submitting ? "Joining…" : "Get early access"}
          {!submitting && <span aria-hidden="true">↗</span>}
        </button>
      </div>
      {status.kind === "error" && (
        <p id={messageId} role="alert" className="mt-3 text-sm text-danger">
          {status.message}
        </p>
      )}
    </form>
  );
}
