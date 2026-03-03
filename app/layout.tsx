import type { Metadata } from "next";
import { K2D } from "next/font/google";
import "./globals.css";

const k2d = K2D({ 
  subsets: ["thai", "latin"], 
  weight: ["300", "400", "600", "700"],
  variable: "--font-k2d",
});

export const metadata: Metadata = {
  title: "SignTranslate",
  description: "AI Sign Language Translator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${k2d.variable}`}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}