"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, MapPin, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEstates } from "@/context/EstatesContext";

const GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan",
  "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Sousse",
  "Monastir", "Mahdia", "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid",
  "Gabès", "Medenine", "Tataouine", "Gafsa", "Tozeur", "Kebili",
];
const TYPES = ["All Types", "Apartment", "House", "Studio", "Villa"];
const PURPOSES: { value: "all" | "rent" | "sale"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "rent", label: "Rent" },
  { value: "sale", label: "Buy" },
];

interface SearchBarProps {
  compact?: boolean;
  onSearch?: (params: { city: string; type: string; purpose: string }) => void;
}

export function SearchBar({ compact = false, onSearch }: SearchBarProps) {
  const router = useRouter();
  const { estates } = useEstates();
  const [city, setCity] = useState("");
  const [type, setType] = useState("All Types");
  const [purpose, setPurpose] = useState<"all" | "rent" | "sale">("all");
  const [cityOpen, setCityOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  // Suggestions mix the full governorate list with actual zone names pulled
  // from the listings, so picking one always matches something real.
  const zoneNames = useMemo(
    () => Array.from(new Set(estates.map((e) => e.zone))).sort(),
    [estates]
  );
  const suggestions = useMemo(
    () => [...GOVERNORATES, ...zoneNames],
    [zoneNames]
  );

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ city, type, purpose });
    } else {
      router.push(`/explore?city=${encodeURIComponent(city)}&type=${encodeURIComponent(type)}&purpose=${purpose}`);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-sm">
        <Search size={16} className="text-[#94A3B8] flex-shrink-0" />
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search by city or zone..."
          className="border-0 shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button size="sm" onClick={handleSearch} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg flex-shrink-0">
          Search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center sm:justify-start">
        <div className="inline-flex bg-white/20 backdrop-blur-sm rounded-xl p-1 gap-1">
          {PURPOSES.map((p) => (
            <button
              key={p.value}
              onClick={() => setPurpose(p.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                purpose === p.value ? "bg-white text-[#2563EB]" : "text-white hover:bg-white/10"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 p-2 flex flex-col sm:flex-row gap-2">
      {/* City */}
      <div className="flex-1 relative">
        <button
          onClick={() => { setCityOpen(!cityOpen); setTypeOpen(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8FAFC] transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-[#2563EB]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#94A3B8] font-medium">Location</div>
            <div className={`text-sm truncate ${city ? "text-[#1F2937] font-medium" : "text-[#CBD5E1]"}`}>
              {city || "Select city or zone"}
            </div>
          </div>
          <ChevronDown size={14} className="text-[#94A3B8]" />
        </button>
        {cityOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-20 overflow-hidden">
            <div className="p-2">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Type a city..."
                className="mb-2 rounded-lg"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto pb-2">
              {suggestions.filter((c) => c.toLowerCase().includes(city.toLowerCase())).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCity(c); setCityOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F8FAFC] flex items-center gap-2"
                >
                  <MapPin size={13} className="text-[#94A3B8]" /> {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hidden sm:block w-px bg-[#E2E8F0] my-2" />

      {/* Property Type */}
      <div className="flex-1 relative">
        <button
          onClick={() => { setTypeOpen(!typeOpen); setCityOpen(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8FAFC] transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#94A3B8] font-medium">Property Type</div>
            <div className={`text-sm truncate ${type !== "All Types" ? "text-[#1F2937] font-medium" : "text-[#CBD5E1]"}`}>
              {type}
            </div>
          </div>
          <ChevronDown size={14} className="text-[#94A3B8]" />
        </button>
        {typeOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-20 overflow-hidden">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setTypeOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F8FAFC] ${type === t ? "text-[#2563EB] font-medium" : "text-[#1F2937]"}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search button */}
      <div className="flex items-center">
        <Button
          onClick={handleSearch}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 h-auto rounded-xl flex items-center gap-2 w-full sm:w-auto"
        >
          <Search size={18} /> Search
        </Button>
      </div>
    </div>
    </div>
  );
}
