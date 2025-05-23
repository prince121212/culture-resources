import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "文明",
  description: "一个用户可以上传和下载资源链接的平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (err) {}
          `
        }} />
        {process.env.NODE_ENV === 'development' && (
          <script src="/theme-debug.js" defer></script>
        )}
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <Toaster 
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              className: 'bg-card text-card-foreground border border-border',
            }}
          />
          <div className="min-h-screen bg-newspaper dark:bg-gray-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
