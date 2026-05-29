"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Account created! Check your email for confirmation.");
    router.push("/login");
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__headline">
          <span>Start your journey</span>
          <h1>Create your Holiday Planner account</h1>
          <p>
            Set up your account to save destinations, build itineraries, and organize every
            trip with clarity and ease.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>

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

          <label>
            Password
            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="button button--primary auth-button"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          {status ? <p className="auth-message">{status}</p> : null}
        </form>

        <p className="auth-footer">
          Already have an account? <a href="/login" className="cursor-pointer">Login instead</a>.
        </p>
      </div>
    </main>
  );
}
