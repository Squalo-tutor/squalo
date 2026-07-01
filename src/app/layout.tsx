import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const poppins = localFont({
  variable: "--font-poppins",
  src: [
    { path: "../../public/fonts/Poppins-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/Poppins-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  src: [{ path: "../../public/fonts/Inter-Variable.woff2", weight: "100 900", style: "normal" }],
});

export const metadata: Metadata = {
  title: "Squalo — Ripetizioni vicino a te",
  description: "Trovi tutor di ogni materia vicino a te, ovunque tu sia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
