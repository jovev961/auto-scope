import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import styles from "./layout.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Auto Scope | Automotive Catalogue",
  description: "Explore automotive brands, model families, generations, variants, and detailed engine specifications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>
        <header className={styles.header}>
          <Nav />
        </header>
        <main className={styles.main}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
