"use client";

import { useRouter } from "next/navigation";
import {
  X, Scale, Bed, Bath, Maximize2, Car, Sofa, Wind, Wifi, Coffee,
  TreePine, Building2, MapPin, ArrowLeft, Check, Minus,
} from "lucide-react";
import { useEstates, type Estate } from "@/context/EstatesContext";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

const TYPE_LABELS: Record<Estate["type"], string> = {
  apartment: "Apartment",
  house: "House",
  studio: "Studio",
  villa: "Villa",
};

function formatPrice(estate: Estate) {
  const amount = estate.price.toLocaleString();
  return estate.listingPurpose === "rent" ? `${amount} DT/mo` : `${amount} DT`;
}

function BoolCell({ value }: { value: boolean }) {
  return value ? (
    <Check size={16} className="text-[#10B981] mx-auto" />
  ) : (
    <Minus size={16} className="text-[#CBD5E1] mx-auto" />
  );
}

// Each row: a label, an icon, and how to read the value off an Estate.
const SPEC_ROWS: {
  label: string;
  icon: React.ElementType;
  render: (e: Estate) => React.ReactNode;
}[] = [
  { label: "Type", icon: Building2, render: (e) => TYPE_LABELS[e.type] },
  { label: "Purpose", icon: Building2, render: (e) => (e.listingPurpose === "rent" ? "For Rent" : "For Sale") },
  { label: "Governorate", icon: MapPin, render: (e) => e.governorate },
  { label: "Zone", icon: MapPin, render: (e) => e.zone },
  { label: "Bedrooms", icon: Bed, render: (e) => e.rooms },
  { label: "Bathrooms", icon: Bath, render: (e) => e.bathrooms },
  { label: "Living Rooms", icon: Sofa, render: (e) => e.livingRooms },
  { label: "Surface", icon: Maximize2, render: (e) => `${e.surface} m²` },
  { label: "Floor", icon: Building2, render: (e) => e.floor },
  { label: "Kitchen", icon: Coffee, render: (e) => <BoolCell value={e.kitchen} /> },
  { label: "Balcony", icon: TreePine, render: (e) => <BoolCell value={e.balcony} /> },
  { label: "Furnished", icon: Sofa, render: (e) => <BoolCell value={e.furnished} /> },
  { label: "Parking", icon: Car, render: (e) => <BoolCell value={e.parking} /> },
  { label: "Air Conditioning", icon: Wind, render: (e) => <BoolCell value={e.airConditioner} /> },
  { label: "Internet", icon: Wifi, render: (e) => <BoolCell value={e.internet} /> },
];

export default function ComparePage() {
  const router = useRouter();
  const { compareIds, estates, toggleCompare, clearCompare } = useEstates();

  const selected = compareIds
    .map((id) => estates.find((e) => e.id === id))
    .filter((e): e is Estate => Boolean(e));

  if (selected.length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center mx-auto mb-4">
          <Scale size={28} />
        </div>
        <h1 className="text-[#1F2937] font-bold text-2xl mb-2">Nothing to compare yet</h1>
        <p className="text-[#64748B] mb-6">
          Select at least 2 properties using the compare icon on a listing card, then come back here.
        </p>
        <button
          onClick={() => router.push("/explore")}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl px-5 py-2.5 font-medium transition-colors"
        >
          Browse Properties
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#64748B] hover:text-[#2563EB] text-sm mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-[#1F2937] font-bold text-2xl">Compare Properties</h1>
        </div>
        <button
          onClick={clearCompare}
          className="text-[#64748B] hover:text-[#EF4444] text-sm font-medium transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              <th className="text-left p-4 w-40 bg-[#F8FAFC] sticky left-0"></th>
              {selected.map((estate) => (
                <th key={estate.id} className="p-4 align-top min-w-[220px]">
                  <div className="relative rounded-xl overflow-hidden mb-3">
                    <ImageWithFallback
                      src={estate.images[0]}
                      alt={estate.title}
                      className="w-full h-32 object-cover cursor-pointer"
                    />
                    <button
                      onClick={() => toggleCompare(estate.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#64748B] hover:text-[#EF4444] flex items-center justify-center shadow-md transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <h3
                    onClick={() => router.push(`/estate/${estate.id}`)}
                    className="text-[#1F2937] font-semibold text-sm mb-1 line-clamp-2 cursor-pointer hover:text-[#2563EB] transition-colors"
                  >
                    {estate.title}
                  </h3>
                  <div className="text-[#2563EB] font-bold">{formatPrice(estate)}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">
                    {(estate.price / estate.surface).toFixed(1)} DT/m²
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_ROWS.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/60"}>
                <td className="p-4 text-[#374151] text-sm font-medium sticky left-0 bg-inherit">
                  <div className="flex items-center gap-2">
                    <row.icon size={14} className="text-[#94A3B8]" />
                    {row.label}
                  </div>
                </td>
                {selected.map((estate) => (
                  <td key={estate.id} className="p-4 text-center text-[#1F2937] text-sm">
                    {row.render(estate)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
