"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function TripsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const user = data.session?.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      setUserName(
        (user.user_metadata as { full_name?: string })?.full_name ?? user.email ?? null
      );
      setIsLoading(false);
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <main className="page-shell">
        <div className="page-content">
          <span className="page-label">Your trips</span>
          <h1>Loading your trips...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-content">
        <span className="page-label">Your trips</span>
        <h1>{userName ? `Welcome, ${userName}` : "Your trips"}</h1>
        <p>
          This is the place to manage your upcoming journeys. Add your itineraries,
          save destinations, and keep every holiday plan organized in one spot.
        </p>
      </div>
    </main>
  );
}
