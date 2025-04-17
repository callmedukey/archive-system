import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { extractRouterConfig } from "uploadthing/server";

import { cn } from "@/lib/utils";

import "./globals.css";
import { ourFileRouter } from "./api/uploadthing/core";

const pretendard = localFont({
  src: [
    {
      path: "./fonts/PretendardVariable.woff2",
      weight: "45 920",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "아카이브 관리 시스템",
  description: "아카이브 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("antialiased", pretendard.variable, "font-pretendard")}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <SessionProvider>
          {children}
          <Toaster position="bottom-center" />
        </SessionProvider>
      </body>
    </html>
  );
}
