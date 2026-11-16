import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@/styles/theme.css";
import "@/styles/app.css";
import "@/styles/workspace.css";
import "@/styles/homepage.css";
import "@/styles/research-pages.css";
import "@/styles/account-entry.css";
export const metadata: Metadata = {
  title: "CloudLens — Cloud cost clarity",
  description:
    "Track AWS spend, investigate cost changes, and review savings opportunities.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
