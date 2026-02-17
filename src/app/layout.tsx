import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Platform",
  description: "Build faster, scale smarter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
