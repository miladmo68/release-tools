import type { Metadata } from "next";
import "@fontsource/big-shoulders-display/latin-700";
import "@fontsource/big-shoulders-display/latin-900";
import "@fontsource/instrument-sans/latin-400";
import "@fontsource/instrument-sans/latin-500";
import "@fontsource/instrument-sans/latin-600";
import "@fontsource/jetbrains-mono/latin-400";
import "@fontsource/jetbrains-mono/latin-500";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kestrel Motor Co. | Pre-owned cars, priced by the month",
  description: "Shop certified pre-owned cars by monthly payment. Inspected, transparent, and ready for a test drive. Demo experience with fictional inventory."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
