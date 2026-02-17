import type { Metadata } from "next";
import { PersonalizeProvider } from "@/components/context/PersonalizeContext";
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
      <body className="flex min-h-screen flex-col">
        <PersonalizeProvider>{children}</PersonalizeProvider>
      </body>
    </html>
  );
}
