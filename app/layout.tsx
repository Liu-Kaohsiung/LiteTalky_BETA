import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiteTalky",
  description: "LiteTalky workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-frame">{children}</div>
      </body>
    </html>
  );
}
