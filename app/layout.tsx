import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Holiday Planner",
  description: "Plan your holidays/vacations with ease. Create itineraries ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="site-header">
          <a href="/" className="brand">
            Holiday Planner
          </a>

          <nav className="site-nav">
            <a href="/" className="nav-link">
              Home
            </a>
            <a href="/signup" className="nav-link">
              Sign up
            </a>
            <a href="/login" className="nav-link">
              Login
            </a>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
