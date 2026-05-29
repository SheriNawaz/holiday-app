"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function AuthNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="site-nav">
      <a href="/" className="nav-link cursor-pointer">
        Home
      </a>
      <a href="/trips" className="nav-link cursor-pointer">
        Trips
      </a>

      {user ? (
        <button
          type="button"
          onClick={handleLogout}
          className="nav-link cursor-pointer"
        >
          Logout
        </button>
      ) : (
        <>
          <a href="/signup" className="nav-link cursor-pointer">
            Sign up
          </a>
          <a href="/login" className="nav-link cursor-pointer">
            Login
          </a>
        </>
      )}
    </nav>
  );
}
