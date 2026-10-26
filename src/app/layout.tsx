import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@/styles/theme.css";
import "@/styles/app.css";
import "@/styles/workspace.css";
import "@/styles/homepage.css";
import "@/styles/research-pages.css";
export const metadata: Metadata = {
  title: "CloudLens — Cloud cost clarity",
  description:
    "Understand your AWS spend, investigate changes, and make confident savings decisions. Portfolio concept with simulated data.",
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
