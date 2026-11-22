"use client";

import { useId, useState, type FormEvent } from "react";
import { site } from "@/lib/site";

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
      <p role="status" className="rounded-2xl border border-line bg-panel px-5 py-4 text-base text-fg">
        <span className="text-brand">✓</span> You&apos;re on the list. We&apos;ll be in touch when
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
          className="min-h-12 flex-1 rounded-full border border-fg/20 bg-fg/5 px-5 text-base text-fg placeholder:text-subtle focus:border-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/30"
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
          className="min-h-12 cursor-pointer rounded-full bg-invert px-6 text-base font-semibold text-on-invert transition-colors duration-200 hover:bg-invert/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Joining…" : "Get early access"}
        </button>
      </div>
      {status.kind === "error" && (
        <p id={messageId} role="alert" className="mt-3 text-sm text-red-300">
          {status.message}
        </p>
      )}
    </form>
  );
}
