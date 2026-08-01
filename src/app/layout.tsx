import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pulse AI",
  description: "Your personalized feed of the latest updates across the tech ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
