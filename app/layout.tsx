import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UI Design Showcase",
  description: "A collection of modern UI designs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
