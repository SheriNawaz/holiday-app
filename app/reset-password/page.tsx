"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setIsLoading(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus(
      "If an account exists for that email, a password reset link has been sent."
    );
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__headline">
          <span>Reset your password</span>
          <h1>Get a new password link</h1>
          <p>Enter your account email and we’ll send a link to reset your password.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="button button--primary auth-button"
            disabled={isLoading}
          >
            {isLoading ? "Sending link..." : "Send reset link"}
          </button>

          {status ? <p className="auth-message">{status}</p> : null}
        </form>

        <p className="auth-footer">
          Back to <a href="/login" className="cursor-pointer">Login</a>.
        </p>
      </div>
    </main>
  );
}
