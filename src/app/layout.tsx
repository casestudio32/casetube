import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CaseTube — The AI Operating System for YouTube Creators",
  description:
    "Discover your niche, research keywords, generate scripts, design thumbnails, and grow your YouTube channel with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} bg-[#080808] text-white antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
