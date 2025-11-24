import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nangman.cloud"),
  title: {
    default: "Nangman Infra | We Build the Invisible",
    template: "%s | Nangman Infra",
  },
  description: "국립한밭대학교 인프라 엔지니어링 팀, 낭만 인프라 공식 홈페이지. 보이지 않지만, 모든 것의 기반이 됩니다.",
  keywords: [
    "인프라",
    "인프라 엔지니어",
    "클라우드",
    "AWS",
    "네트워크",
    "운영체제",
    "국립한밭대학교",
    "낭만 인프라",
    "Nangman Infra",
    "Infrastructure Engineering",
  ],
  authors: [{ name: "Nangman Infra Team" }],
  creator: "Nangman Infra",
  publisher: "Nangman Infra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://nangman.cloud",
    siteName: "Nangman Infra",
    title: "Nangman Infra | We Build the Invisible",
    description: "국립한밭대학교 인프라 엔지니어링 팀, 낭만 인프라 공식 홈페이지",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Nangman Infra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nangman Infra | We Build the Invisible",
    description: "국립한밭대학교 인프라 엔지니어링 팀, 낭만 인프라 공식 홈페이지",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://nangman.cloud",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Header />
          <div className="pt-16 flex flex-col min-h-screen">
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
