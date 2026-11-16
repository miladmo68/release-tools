import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ivory Arc | Wedding seating studio",
  description: "A considered way to shape the room for a celebration."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
