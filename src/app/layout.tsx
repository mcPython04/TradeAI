import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
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
  title: "Trade Journal",
  description: "Log trades and track your P&L.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="font-semibold">
                Trade Journal
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Show when="signed-in">
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/trades">Trades</Link>
                  <Link href="/trades/new">Add Trade</Link>
                  <UserButton />
                </Show>
                <Show when="signed-out">
                  <SignInButton mode="modal" />
                </Show>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
