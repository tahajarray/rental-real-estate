"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Home, Compass, Building2, Bookmark, Phone, Plus, User, LogOut, ChevronDown, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/contact", label: "Contact", icon: Phone },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-[#1F2937] font-bold" style={{ fontSize: "1.1rem" }}>NestFinder</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                href={to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? "text-[#2563EB] bg-[#EFF6FF]"
                    : "text-[#64748B] hover:text-[#1F2937] hover:bg-[#F8FAFC]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pl-2 pr-3 py-1 hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors">
                    <ImageWithFallback src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-sm font-medium text-[#1F2937] hidden sm:block max-w-24 truncate">{user.name.split(" ")[0]}</span>
                    <ChevronDown size={14} className="text-[#94A3B8]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border border-[#E2E8F0]">
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                    <User size={15} className="mr-2 text-[#64748B]" /> Profile
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => router.push("/admin")} className="cursor-pointer">
                      <Building2 size={15} className="mr-2 text-[#64748B]" /> Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500">
                    <LogOut size={15} className="mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="text-[#64748B] hidden sm:flex">
                  Login
                </Button>
                <Button size="sm" onClick={() => router.push("/signup")} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg">
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
                      <Building2 size={15} className="text-white" />
                    </div>
                    <span className="font-bold text-[#1F2937]">NestFinder</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="text-[#94A3B8]">
                    <X size={20} />
                  </button>
                </div>
                <div className="px-4 py-4 space-y-1">
                  {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      href={to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(to)
                          ? "text-[#2563EB] bg-[#EFF6FF]"
                          : "text-[#64748B] hover:text-[#1F2937] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <Icon size={18} /> {label}
                    </Link>
                  ))}
                </div>
                {!user && (
                  <div className="px-4 pt-2 space-y-2 border-t border-[#E2E8F0] mt-2">
                    <Button className="w-full" variant="outline" onClick={() => { router.push("/login"); setMobileOpen(false); }}>
                      Login
                    </Button>
                    <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white" onClick={() => { router.push("/signup"); setMobileOpen(false); }}>
                      Sign Up
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
