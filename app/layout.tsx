import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Decision Graph",
  description: "Visual decision board for daily branching choices"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-background text-foreground">
          <div className="container py-12 md:py-16">
            <header className="flex items-center justify-between gap-4 border-b pb-6">
              <div>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Decision Graph</p>
                <h1 className="text-2xl font-semibold">A calm place for daily choices</h1>
              </div>
              <span className="rounded-full bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground">
                Prototype
              </span>
            </header>
            <div className="pt-8">{children}</div>
          </div>
        </main>
      </body>
    </html>
  );
}
