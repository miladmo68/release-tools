import type { Metadata } from "next";
import "@fontsource/big-shoulders-display/700.css";
import "@fontsource/big-shoulders-display/900.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
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
