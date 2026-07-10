"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CompareBar } from "./CompareBar";
import { useEstates } from "@/context/EstatesContext";
import { useAuth } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";

const AUTH_ROUTES = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);
  const { compareIds } = useEstates();
  const { user } = useAuth();
  const showCompareBar = !isAuthPage && compareIds.length > 0 && pathname !== "/compare";

  return (
    <NotificationsProvider userId={user?.id ?? null}>
      {!isAuthPage && <Navbar />}
      <main className={`flex-1 ${showCompareBar ? "pb-20" : ""}`}>{children}</main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <CompareBar />}
    </NotificationsProvider>
  );
}
