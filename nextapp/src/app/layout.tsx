import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { EstatesProvider } from "@/context/EstatesContext";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Rental Real Estate Agency",
  description:
    "This rental real estate platform allows users to search, save, and manage properties, offering advanced filters and personalized listings for seamless browsing.",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <EstatesProvider>
            <AppShell>{children}</AppShell>
          </EstatesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
