"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bookmark, Share2, Flag, ChevronLeft, ChevronRight,
  Bed, Bath, Maximize2, Car, Sofa, Wind, Wifi, CheckCircle,
  MapPin, Phone, MessageSquare, Home, Coffee, TreePine,
  Building, Shield, Star, CalendarClock, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { useEstates, type VisitSlot } from "@/context/EstatesContext";
import { useAuth } from "@/context/AuthContext";
import { PropertyCard } from "@/components/PropertyCard";

const STATUS_LABELS = { active: "Available", rented: "Rented", sold: "Sold" } as const;

function VisitCalendar({ estateId, slots }: { estateId: string; slots: VisitSlot[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const { bookVisitSlot } = useEstates();
  const [bookedSlotId, setBookedSlotId] = useState<string | null>(null);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  const openSlots = slots.filter((s) => !s.isBooked);
  const datesWithSlots = Array.from(new Set(openSlots.map((s) => s.date))).sort();
  const [selectedDate, setSelectedDate] = useState<string | null>(datesWithSlots[0] ?? null);

  // Build a small single-month calendar grid covering today .. the last available slot.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const leadingBlanks = monthStart.getDay(); // 0 (Sun) - 6 (Sat)
  const monthLabel = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const slotsByDate = openSlots.reduce<Record<string, VisitSlot[]>>((acc, s) => {
    (acc[s.date] = acc[s.date] || []).push(s);
    return acc;
  }, {});

  const toDateStr = (day: number) =>
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const handleBook = (slotId: string) => {
    if (!user) { router.push("/login"); return; }
    setConflictMsg(null);
    const ok = bookVisitSlot(estateId, slotId, user.name);
    if (!ok) {
      setConflictMsg("Sorry, that slot was just booked by someone else. Please pick another time.");
      return;
    }
    setBookedSlotId(slotId);
  };

  const selectedSlots = selectedDate ? slotsByDate[selectedDate] ?? [] : [];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
      <h2 className="text-[#1F2937] font-semibold mb-1 flex items-center gap-2" style={{ fontSize: "1.1rem" }}>
        <CalendarClock size={18} className="text-[#2563EB]" /> Schedule a Visit
      </h2>
      <p className="text-[#64748B] text-sm mb-4">Pick a highlighted date to see available time slots.</p>

      {bookedSlotId && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#10B981] rounded-xl px-4 py-3 text-sm mb-4">
          Visit request sent! The listing owner will confirm your slot.
        </div>
      )}

      {conflictMsg && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] rounded-xl px-4 py-3 text-sm mb-4">
          {conflictMsg}
        </div>
      )}

      {datesWithSlots.length === 0 ? (
        <p className="text-[#94A3B8] text-sm">No visit slots available right now. Contact the owner directly to arrange a time.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Small month calendar */}
          <div className="max-w-[280px]">
            <div className="text-sm font-medium text-[#374151] mb-2">{monthLabel}</div>
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-[#94A3B8]" style={{ fontSize: "0.65rem" }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = toDateStr(day);
                const hasSlots = !!slotsByDate[dateStr];
                const isSelected = selectedDate === dateStr;
                const isPast = dateStr < today.toISOString().slice(0, 10);
                return (
                  <button
                    key={day}
                    disabled={!hasSlots}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[#2563EB] text-white"
                        : hasSlots
                        ? "bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]"
                        : isPast
                        ? "text-[#E2E8F0]"
                        : "text-[#CBD5E1]"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots for selected date */}
          <div>
            <div className="text-sm font-medium text-[#374151] mb-2">
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
                : "Select a date"}
            </div>
            {selectedSlots.length === 0 ? (
              <p className="text-[#94A3B8] text-sm">No slots on this date.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleBook(slot.id)}
                    disabled={bookedSlotId === slot.id}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      bookedSlotId === slot.id
                        ? "bg-[#2563EB] text-white border-[#2563EB]"
                        : "bg-white text-[#374151] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]"
                    }`}
                  >
                    <Clock size={13} /> {slot.startTime}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function EstateDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { getEstate, estates, savedIds, toggleSave } = useEstates();
  const { user } = useAuth();
  const [imgIdx, setImgIdx] = useState(0);

  const estate = getEstate(id || "");

  if (!estate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="text-[#1F2937] font-bold mb-2">Property not found</h2>
          <Button onClick={() => router.push("/explore")} className="bg-[#2563EB] text-white rounded-xl">Back to Explore</Button>
        </div>
      </div>
    );
  }

  const isSaved = savedIds.includes(estate.id);
  const similar = estates.filter((e) => e.id !== estate.id && (e.governorate === estate.governorate || e.type === estate.type)).slice(0, 3);

  const handleSave = () => { if (!user) router.push("/login"); else toggleSave(estate.id); };

  const specItems = [
    { icon: Bed, label: "Bedrooms", value: `${estate.rooms}` },
    { icon: Bath, label: "Bathrooms", value: `${estate.bathrooms}` },
    { icon: Maximize2, label: "Surface", value: `${estate.surface} m²` },
    { icon: Home, label: "Living Rooms", value: `${estate.livingRooms}` },
    { icon: Coffee, label: "Kitchen", value: estate.kitchen ? "Yes" : "No" },
    { icon: TreePine, label: "Balcony", value: estate.balcony ? "Yes" : "No" },
    { icon: Building, label: "Floor", value: estate.floor === 0 ? "Ground" : `${estate.floor}th` },
    { icon: Car, label: "Parking", value: estate.parking ? "Included" : "No" },
    { icon: Sofa, label: "Furnished", value: estate.furnished ? "Yes" : "No" },
    { icon: Wind, label: "Air Cond.", value: estate.airConditioner ? `Yes (${estate.acUnits} unit${estate.acUnits !== 1 ? "s" : ""})` : "No" },
    { icon: Wifi, label: "Internet", value: estate.internet ? "Included" : "No" },
    { icon: CheckCircle, label: "Status", value: STATUS_LABELS[estate.status] },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-[#64748B]">
          <button onClick={() => router.push("/")} className="hover:text-[#2563EB]">Home</button>
          <span>/</span>
          <button onClick={() => router.push("/explore")} className="hover:text-[#2563EB]">Explore</button>
          <span>/</span>
          <span className="text-[#1F2937] font-medium truncate max-w-xs">{estate.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0]">
              <div className="relative aspect-video">
                <ImageWithFallback
                  src={estate.images[imgIdx]}
                  alt={estate.title}
                  className="w-full h-full object-cover"
                />
                {estate.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((i) => (i - 1 + estate.images.length) % estate.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % estate.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {imgIdx + 1} / {estate.images.length}
                </div>
              </div>
              {/* Thumbnails */}
              {estate.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {estate.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-[#2563EB]" : "border-transparent"}`}
                    >
                      <ImageWithFallback src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      estate.type === "apartment" ? "bg-[#EFF6FF] text-[#2563EB]" :
                      estate.type === "villa" ? "bg-[#F5F3FF] text-[#8B5CF6]" :
                      estate.type === "studio" ? "bg-[#FFF7ED] text-[#F59E0B]" :
                      "bg-[#ECFDF5] text-[#10B981]"
                    }`}>
                      {estate.type.charAt(0).toUpperCase() + estate.type.slice(1)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#1F2937]">
                      {estate.listingPurpose === "rent" ? "For Rent" : "For Sale"}
                    </span>
                    {estate.status !== "active" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#EF4444]">
                        {STATUS_LABELS[estate.status]}
                      </span>
                    )}
                  </div>
                  <h1 className="text-[#1F2937] mb-2" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{estate.title}</h1>
                  <div className="flex items-center gap-1.5 text-[#64748B] text-sm">
                    <MapPin size={14} className="text-[#2563EB]" />
                    {estate.address}, {estate.zone}, {estate.governorate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#10B981] font-bold" style={{ fontSize: "1.75rem" }}>{estate.price.toLocaleString()} DT</div>
                  <div className="text-[#94A3B8] text-sm">{estate.listingPurpose === "rent" ? "per month" : "sale price"}</div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="text-[#1F2937] font-semibold mb-5" style={{ fontSize: "1.1rem" }}>Property Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {specItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                    <div className="flex items-center gap-1.5 text-[#64748B] mb-1" style={{ fontSize: "0.75rem" }}>
                      <Icon size={13} className="text-[#2563EB]" /> {label}
                    </div>
                    <div className="text-[#1F2937] font-semibold text-sm">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="text-[#1F2937] font-semibold mb-3" style={{ fontSize: "1.1rem" }}>Description</h2>
              <p className="text-[#64748B] leading-relaxed text-sm">{estate.description}</p>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="text-[#1F2937] font-semibold mb-4" style={{ fontSize: "1.1rem" }}>Location</h2>
              <div className="bg-[#EFF6FF] rounded-xl h-48 flex flex-col items-center justify-center gap-3 border border-[#BFDBFE]">
                <MapPin size={32} className="text-[#2563EB]" />
                <div className="text-center">
                  <div className="text-[#2563EB] font-semibold text-sm">{estate.address}</div>
                  <div className="text-[#64748B] text-xs">{estate.zone}, {estate.governorate}</div>
                </div>
                <div className="text-[#94A3B8] text-xs">Google Maps integration available with API key</div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-wrap gap-3">
              <Button
                onClick={handleSave}
                variant="outline"
                className={`flex items-center gap-2 rounded-xl border-[#E2E8F0] ${isSaved ? "text-[#2563EB] border-[#93C5FD]" : "text-[#64748B]"}`}
              >
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" className="flex items-center gap-2 rounded-xl border-[#E2E8F0] text-[#64748B]">
                <Share2 size={16} /> Share
              </Button>
              <Button variant="outline" className="flex items-center gap-2 rounded-xl border-[#E2E8F0] text-[#64748B]">
                <Flag size={16} /> Report
              </Button>
            </div>
          </div>

          {/* Right Column: Owner Card */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sticky top-24">
              <h3 className="font-semibold text-[#1F2937] mb-4">Listed by</h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative">
                  <ImageWithFallback
                    src={estate.ownerAvatar}
                    alt={estate.ownerName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {estate.ownerVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center border-2 border-white">
                      <Shield size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-[#1F2937] text-sm">{estate.ownerName}</div>
                  {estate.ownerVerified && (
                    <div className="flex items-center gap-1 text-[#10B981] mt-0.5" style={{ fontSize: "0.72rem" }}>
                      <Shield size={11} /> Verified Promoter
                    </div>
                  )}
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={11} className="text-[#F59E0B] fill-current" />
                    ))}
                    <span className="text-[#64748B] ml-1" style={{ fontSize: "0.72rem" }}>5.0</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl flex items-center gap-2">
                  <Phone size={15} /> Contact Promoter
                </Button>
                <Button variant="outline" className="w-full rounded-xl border-[#E2E8F0] text-[#374151] flex items-center gap-2">
                  <MessageSquare size={15} /> Send Message
                </Button>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-[#1F2937] font-bold text-sm">{estate.views}</div>
                  <div className="text-[#94A3B8]" style={{ fontSize: "0.7rem" }}>Views</div>
                </div>
                <div>
                  <div className="text-[#1F2937] font-bold text-sm">{estate.savesCount}</div>
                  <div className="text-[#94A3B8]" style={{ fontSize: "0.7rem" }}>Saves</div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-[#EFF6FF] rounded-2xl border border-[#BFDBFE] p-4">
              <div className="flex items-center gap-2 text-[#2563EB] font-semibold text-sm mb-2">
                <Shield size={15} /> Listing Guarantee
              </div>
              <p className="text-[#64748B] text-xs leading-relaxed">
                This listing has been verified by our team. All information is accurate and up to date.
              </p>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[#1F2937] font-bold mb-6" style={{ fontSize: "1.4rem" }}>Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((e) => <PropertyCard key={e.id} estate={e} />)}
            </div>
          </section>
        )}

        {/* Visit Calendar - bottom of page */}
        <section className="mt-12">
          <VisitCalendar estateId={estate.id} slots={estate.visitSlots} />
        </section>
      </div>
    </div>
  );
}
