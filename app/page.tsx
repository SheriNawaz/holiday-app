"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const slides = [
  "https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1708361089093-beef4c4584e7?q=80&w=1116&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1518638150340-f706e86654de?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const user = data.session?.user;
      if (!user) {
        setUserName(null);
        return;
      }
      setUserName(
        (user.user_metadata as { full_name?: string })?.full_name ?? user.email ?? null
      );
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        const user = session?.user;
        setUserName(
          user
            ? (user.user_metadata as { full_name?: string })?.full_name ??
                user.email ??
                null
            : null
        );
      }
    );

    return () => {
      mounted = false;
      authListener.subscription?.unsubscribe();
    };
  }, []);

  return (
    <main className="hero">
      <div className="hero__slider">
        {slides.map((src, index) => (
          <div
            key={`${index}-${src}`}
            className={`slide slide-${index + 1}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>

      <div className="hero__overlay" />

      <div className="hero__content">
        <span className="hero__eyebrow">Travel made effortless</span>
        <h1>{userName ? `Welcome back, ${userName}` : "Holiday Planner"}</h1>
        <p>
          Plan your next trip with ease: discover fresh destinations, organize every detail,
          and move from inspiration to itinerary in one beautifully simple place.
        </p>

        <div className="hero__actions">
          {userName ? (
            <a href="/trips" className="button button--primary cursor-pointer">
              View Your Trips
            </a>
          ) : (
            <>
              <a href="/login" className="button button--primary cursor-pointer">
                Login
              </a>
              <a href="/signup" className="button button--secondary cursor-pointer">
                Sign up
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
