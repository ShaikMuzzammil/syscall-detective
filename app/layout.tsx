import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/shared/Navigation";
import ThemeProvider from "@/components/shared/ThemeProvider";
import { Toaster } from "react-hot-toast";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Syscall Detective — See What Your Programs Are Really Doing",
  description:
    "Reverse-engineer any Linux binary through real strace data, AI analysis, and live kernel visualization. No source code required.",
  keywords: [
    "syscall", "strace", "linux", "binary analysis", "security", "performance",
    "kernel", "reverse engineering", "malware detection",
  ],
  openGraph: {
    title: "Syscall Detective",
    description: "See What Your Programs Are Really Doing",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        <ThemeProvider />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  );
}
