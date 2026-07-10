"use client";

import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

const CONTACT_INFO = [
  { icon: MapPin, label: "Address", value: "Avenue Habib Bourguiba, 1000 Tunis, Tunisia", color: "#2563EB" },
  { icon: Phone, label: "Phone", value: "+216 71 234 567", color: "#10B981" },
  { icon: Mail, label: "Email", value: "hello@nestfinder.tn", color: "#F59E0B" },
  { icon: Clock, label: "Working Hours", value: "Monday–Friday: 9am – 6pm", color: "#8B5CF6" },
];

function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-[#2563EB] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-white font-bold mb-3" style={{ fontSize: "2.2rem" }}>Get In Touch</h1>
          <p className="text-white/80 text-sm max-w-lg mx-auto">
            Have a question, need help finding your next home, or want to list your property? We're here to help.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-5">
          {/* Map Placeholder */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1503917988258-f87a78e3c995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
              alt="Tunis office location"
              className="w-full h-56 object-cover"
            />
            <div className="p-4 bg-[#EFF6FF] border-t border-[#BFDBFE] flex items-center gap-2">
              <MapPin size={14} className="text-[#2563EB] flex-shrink-0" />
              <span className="text-[#2563EB] text-sm font-medium">Avenue Habib Bourguiba, Tunis</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <h3 className="font-semibold text-[#1F2937] col-span-full mb-1">Contact Information</h3>
            {CONTACT_INFO.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + "15" }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <div className="text-xs text-[#94A3B8] font-medium">{label}</div>
                  <div className="text-[#1F2937] text-sm mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Social */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h3 className="font-semibold text-[#1F2937] mb-3">Follow Us</h3>
            <div className="flex gap-2">
              {[
                { Icon: Facebook, color: "#1877F2", bg: "#EFF6FF" },
                { Icon: Twitter, color: "#1DA1F2", bg: "#EFF6FF" },
                { Icon: Instagram, color: "#E1306C", bg: "#FFF0F5" },
                { Icon: Linkedin, color: "#0A66C2", bg: "#EFF6FF" },
              ].map(({ Icon, color, bg }, i) => (
                <button key={i} className="w-10 h-10 rounded-xl flex items-center justify-center hover:scale-110 transition-transform" style={{ background: bg }}>
                  <Icon size={18} style={{ color }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
