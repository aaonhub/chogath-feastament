import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
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
  title: "Cho'Gath Feastament",
  description:
    "The definitive Cho'Gath matchup guide by Sakuritou — Rank 1 Cho'Gath worldwide, multi-season Challenger.",
};

function Nav() {
  const links = [
    { href: "/", label: "Home", icon: null },
    {
      href: "/mid",
      label: "Mid",
      icon: (
        <Image src="/images/mid-lane.webp" alt="Mid lane" width={18} height={18} className="h-[18px] w-[18px]" />
      ),
    },
    {
      href: "/top",
      label: "Top",
      icon: (
        <Image src="/images/top-lane.png" alt="Top lane" width={18} height={18} className="h-[18px] w-[18px]" />
      ),
    },
    { href: "/changelog", label: "Changelog", icon: null },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3 sm:gap-4">
        <Link
          href="/"
          className="mr-auto text-lg font-bold tracking-tight text-accent-glow"
        >
          Feastament
        </Link>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 transition hover:bg-card hover:text-foreground"
          >
            {l.icon}
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

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
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-card-border py-6 text-center text-sm text-foreground/40">
          Guide by{" "}
          <a
            href="https://www.twitch.tv/Sakuritou"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-glow hover:underline"
          >
            Sakuritou
          </a>{" "}
          — Rank 1 Cho&apos;Gath Worldwide
        </footer>
      </body>
    </html>
  );
}
