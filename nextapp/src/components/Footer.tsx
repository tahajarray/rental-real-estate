"use client";

import Link from "next/link";
import { Building2, MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1F2937] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <Building2 size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg">NestFinder</span>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              France's premium rental real estate platform. Find your perfect home with ease.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#2563EB] flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/explore", label: "Explore Properties" },
                { to: "/saved", label: "Saved" },
                { to: "/contact", label: "Contact" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link href={to} className="text-[#94A3B8] text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-semibold mb-4">Property Types</h4>
            <ul className="space-y-2">
              {["Apartments", "Houses", "Studios", "Villas", "Featured Listings", "New Arrivals"].map((label) => (
                <li key={label}>
                  <Link href="/explore" className="text-[#94A3B8] text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
                <span className="text-[#94A3B8] text-sm">12 Rue de la Paix, 75001 Paris, France</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#2563EB] flex-shrink-0" />
                <span className="text-[#94A3B8] text-sm">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#2563EB] flex-shrink-0" />
                <span className="text-[#94A3B8] text-sm">hello@nestfinder.fr</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock size={16} className="text-[#2563EB] flex-shrink-0" />
                <span className="text-[#94A3B8] text-sm">Mon–Fri: 9am – 6pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#64748B] text-sm">© 2026 NestFinder. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#64748B] text-sm hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-[#64748B] text-sm hover:text-white transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
