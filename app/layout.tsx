import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingContactWidget } from "@/components/layout/FloatingContactWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMPACT Technologies | AI, Automation & Software",
  description:
    "IMPACT Technologies builds AI systems, intelligent agents, business automation, custom applications and digital products that turn ideas into impact.",
  keywords: [
    "IMPACT Technologies",
    "AI Engineering",
    "AI Agents",
    "Autonomous Agents",
    "Business Automation",
    "CRM Automation",
    "Custom Software",
    "SaaS Platforms",
    "FastAPI",
    "Next.js",
    "Product Studio",
  ],
  authors: [{ name: "IMPACT Technologies" }],
  creator: "IMPACT Technologies",
  publisher: "IMPACT Technologies",
  metadataBase: new URL("https://impact-technologies.com"),
  openGraph: {
    title: "IMPACT Technologies | AI, Automation & Software",
    description:
      "Turning Ideas Into Impact. AI systems, autonomous agents, business automation, and custom digital platforms engineered around real business problems.",
    url: "https://impact-technologies.com",
    siteName: "IMPACT Technologies",
    images: [
      {
        url: "/brand/impact-logo.png",
        width: 451,
        height: 441,
        alt: "IMPACT Technologies Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMPACT Technologies | AI, Automation & Software",
    description: "Turning Ideas Into Impact. AI, autonomous agents, automation & digital products.",
    images: ["/brand/impact-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/brand/impact-logo.png",
    shortcut: "/brand/impact-logo.png",
    apple: "/brand/impact-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[#FAF9F6] text-brand-dark antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingContactWidget />
      </body>
    </html>
  );
}
