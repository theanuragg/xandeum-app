import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xandeum pNode Analytics",
  description: "Comprehensive analytics dashboard for Xandeum proof-of-node performance system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen relative`}
      >
        {/* Global Background Image */}
        <div className="fixed inset-0 bg-[url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/db152321-d045-41b8-a835-86af80fecc29-umbraprivacy-com/assets/images/691b860b87da59a50eecbc1f_bg-2.avif')] bg-cover bg-center bg-no-repeat -z-10 opacity-100"></div>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                border: '1px solid #333',
                color: 'white',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
