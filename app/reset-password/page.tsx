"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Stage = "request" | "set-password" | "done";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // When the user lands from the email link, Supabase fires PASSWORD_RECOVERY.
  // The client automatically exchanges the URL hash tokens into a session.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStage("set-password");
        setStatus(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Step 1: send the reset email ─────────────────────────────────────
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setIsLoading(false);
    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStatus("Check your inbox — we've sent a password reset link.");
    }
  };

  // ── Step 2: update to the new password ───────────────────────────────
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (password.length < 8) {
      setStatus("Error: Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setStatus("Error: Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setStatus(`Error: ${error.message}`);
    } else {
      setStage("done");
      setStatus(null);
      setTimeout(() => router.push("/login"), 2500);
    }
  };

  // ── Done state ────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-card__headline">
            <span>All done</span>
            <h1>Password updated</h1>
            <p>Your new password has been saved. Redirecting you to login…</p>
          </div>
        </div>
      </main>
    );
  }

  // ── Set new password form ─────────────────────────────────────────────
  if (stage === "set-password") {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-card__headline">
            <span>Almost there</span>
            <h1>Set a new password</h1>
            <p>Choose a strong password for your account.</p>
          </div>

          <form className="auth-form" onSubmit={handleSetPassword}>
            <label>
              New password
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              className="button button--primary auth-button"
              disabled={isLoading}
            >
              {isLoading ? "Saving…" : "Update password"}
            </button>

            {status && (
              <p className={`auth-message${status.startsWith("Error") ? " auth-message--error" : ""}`}>
                {status}
              </p>
            )}
          </form>
        </div>
      </main>
    );
  }

  // ── Request reset link form (default) ────────────────────────────────
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__headline">
          <span>Reset your password</span>
          <h1>Get a reset link</h1>
          <p>Enter your account email and we'll send a link to reset your password.</p>
        </div>

        <form className="auth-form" onSubmit={handleRequest}>
          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="button button--primary auth-button"
            disabled={isLoading}
          >
            {isLoading ? "Sending…" : "Send reset link"}
          </button>

          {status && (
            <p className={`auth-message${status.startsWith("Error") ? " auth-message--error" : ""}`}>
              {status}
            </p>
          )}
        </form>

        <p className="auth-footer">
          Back to <a href="/login">Login</a>.
        </p>
      </div>
    </main>
  );
}
