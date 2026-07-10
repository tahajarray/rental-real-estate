"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, Suspense } from "react";
import { SlidersHorizontal, Grid3X3, List, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { useEstates } from "@/context/EstatesContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type SortKey = "newest" | "price_asc" | "price_desc" | "surface" | "popular";

const TYPES = ["All", "Apartment", "House", "Studio", "Villa"];
const GOVERNORATES = [
  "All", "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan",
  "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Sousse",
  "Monastir", "Mahdia", "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid",
  "Gabès", "Medenine", "Tataouine", "Gafsa", "Tozeur", "Kebili",
];
const PURPOSES: { value: "all" | "rent" | "sale"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "rent", label: "For Rent" },
  { value: "sale", label: "For Sale" },
];

interface Filters {
  governorate: string;
  type: string;
  purpose: "all" | "rent" | "sale";
  minSurface: number;
  rooms: string;
  bathrooms: string;
  furnished: boolean | null;
  parking: boolean | null;
  airConditioner: boolean | null;
  internet: boolean | null;
}

const DEFAULT_FILTERS: Filters = {
  governorate: "All",
  type: "All",
  purpose: "all",
  minSurface: 0,
  rooms: "Any",
  bathrooms: "Any",
  furnished: null,
  parking: null,
  airConditioner: null,
  internet: null,
};

function FilterPanel({ filters, setFilters, onApply, onReset }: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const ToggleFilter = ({ label, fkey }: { label: string; fkey: keyof Filters }) => {
    const val = filters[fkey] as boolean | null;
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#374151]">{label}</span>
        <div className="flex gap-1">
          {[null, true, false].map((v, i) => (
            <button
              key={i}
              onClick={() => setFilters({ ...filters, [fkey]: v })}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                val === v ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
            >
              {v === null ? "Any" : v ? "Yes" : "No"}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Purpose */}
      <div>
        <Label className="text-sm font-semibold text-[#1F2937] mb-2 block">Looking to</Label>
        <div className="flex flex-wrap gap-1.5">
          {PURPOSES.map((p) => (
            <button
              key={p.value}
              onClick={() => setFilters({ ...filters, purpose: p.value })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.purpose === p.value ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Governorate */}
      <div>
        <Label className="text-sm font-semibold text-[#1F2937] mb-2 block">Governorate</Label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {GOVERNORATES.map((c) => (
            <button
              key={c}
              onClick={() => setFilters({ ...filters, governorate: c })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.governorate === c ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <Label className="text-sm font-semibold text-[#1F2937] mb-2 block">Property Type</Label>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilters({ ...filters, type: t })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.type === t ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Surface */}
      <div>
        <Label className="text-sm font-semibold text-[#1F2937] mb-3 block">
          Min Surface: <span className="text-[#2563EB]">{filters.minSurface}m²</span>
        </Label>
        <Slider
          min={0}
          max={500}
          step={10}
          value={[filters.minSurface]}
          onValueChange={([v]) => setFilters({ ...filters, minSurface: v })}
        />
      </div>

      {/* Rooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-semibold text-[#1F2937] mb-2 block">Bedrooms</Label>
          <Select value={filters.rooms} onValueChange={(v) => setFilters({ ...filters, rooms: v })}>
            <SelectTrigger className="rounded-lg border-[#E2E8F0] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Any", "1", "2", "3", "4", "5+"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-semibold text-[#1F2937] mb-2 block">Bathrooms</Label>
          <Select value={filters.bathrooms} onValueChange={(v) => setFilters({ ...filters, bathrooms: v })}>
            <SelectTrigger className="rounded-lg border-[#E2E8F0] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Any", "1", "2", "3+"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toggle Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-[#1F2937] block">Features</Label>
        <ToggleFilter label="Furnished" fkey="furnished" />
        <ToggleFilter label="Parking" fkey="parking" />
        <ToggleFilter label="Air Conditioner" fkey="airConditioner" />
        <ToggleFilter label="Internet" fkey="internet" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <Button onClick={onReset} variant="outline" className="flex-1 rounded-xl border-[#E2E8F0]">Reset</Button>
        <Button onClick={onApply} className="flex-1 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white">Apply Filters</Button>
      </div>
    </div>
  );
}

function ExplorePageInner() {
  const searchParams = useSearchParams();
  const { estates } = useEstates();
  const [sort, setSort] = useState<SortKey>("newest");
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    governorate: searchParams.get("city") || "All",
    type: searchParams.get("type") && searchParams.get("type") !== "All Types" ? (searchParams.get("type") || "All") : "All",
    purpose: (searchParams.get("purpose") as Filters["purpose"]) || "all",
  }));
  const [activeFilters, setActiveFilters] = useState<Filters>(filters);

  // Re-sync from the URL whenever it changes with the page already mounted
  // (e.g. searching "For Rent" then "For Sale" from the home page without a
  // full page reload). Without this, the price range keeps whatever bounds
  // were set on first mount because useState's initializer only runs once.
  useEffect(() => {
    const purpose = (searchParams.get("purpose") as Filters["purpose"]) || "all";
    const city = searchParams.get("city") || "All";
    const rawType = searchParams.get("type");
    const type = rawType && rawType !== "All Types" ? rawType : "All";

    setFilters((prev) => {
      if (prev.purpose === purpose && prev.governorate === city && prev.type === type) return prev;
      const next = { ...prev, purpose, governorate: city, type };
      setActiveFilters(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = [...estates];
    if (activeFilters.governorate !== "All") {
      const q = activeFilters.governorate.trim().toLowerCase();
      list = list.filter((e) =>
        e.governorate.toLowerCase().includes(q) ||
        e.zone.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q)
      );
    }
    if (activeFilters.type !== "All") list = list.filter((e) => e.type.toLowerCase() === activeFilters.type.toLowerCase());
    if (activeFilters.purpose !== "all") list = list.filter((e) => e.listingPurpose === activeFilters.purpose);
    list = list.filter((e) => e.surface >= activeFilters.minSurface);
    if (activeFilters.rooms !== "Any") {
      const r = activeFilters.rooms === "5+" ? 5 : parseInt(activeFilters.rooms);
      list = list.filter((e) => activeFilters.rooms === "5+" ? e.rooms >= r : e.rooms === r);
    }
    if (activeFilters.bathrooms !== "Any") {
      const b = activeFilters.bathrooms === "3+" ? 3 : parseInt(activeFilters.bathrooms);
      list = list.filter((e) => activeFilters.bathrooms === "3+" ? e.bathrooms >= b : e.bathrooms === b);
    }
    if (activeFilters.furnished !== null) list = list.filter((e) => e.furnished === activeFilters.furnished);
    if (activeFilters.parking !== null) list = list.filter((e) => e.parking === activeFilters.parking);
    if (activeFilters.airConditioner !== null) list = list.filter((e) => e.airConditioner === activeFilters.airConditioner);
    if (activeFilters.internet !== null) list = list.filter((e) => e.internet === activeFilters.internet);

    switch (sort) {
      case "newest": return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "price_asc": return list.sort((a, b) => a.price - b.price);
      case "price_desc": return list.sort((a, b) => b.price - a.price);
      case "surface": return list.sort((a, b) => b.surface - a.surface);
      case "popular": return list.sort((a, b) => b.savesCount - a.savesCount);
      default: return list;
    }
  }, [estates, activeFilters, sort]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-[#1F2937] mb-4" style={{ fontSize: "1.5rem", fontWeight: 700 }}>Explore Properties in Tunisia</h1>
          <SearchBar
            compact
            onSearch={(p) => {
              const purpose = (p.purpose as Filters["purpose"]) || "all";
              const next: Filters = {
                ...activeFilters,
                governorate: p.city || "All",
                type: p.type === "All Types" ? "All" : p.type,
                purpose,
              };
              setActiveFilters(next);
              setFilters(next);
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sticky top-24">
              <h3 className="font-semibold text-[#1F2937] mb-4">Filters</h3>
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                onApply={() => setActiveFilters(filters)}
                onReset={() => { setFilters(DEFAULT_FILTERS); setActiveFilters(DEFAULT_FILTERS); }}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-[#64748B] text-sm">
                <span className="font-semibold text-[#1F2937]">{filtered.length}</span> properties found
              </p>
              <div className="flex items-center gap-2">
                {/* Mobile filter trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden rounded-xl border-[#E2E8F0] flex items-center gap-2">
                      <SlidersHorizontal size={15} /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-5 overflow-y-auto">
                    <h3 className="font-semibold text-[#1F2937] mb-4">Filters</h3>
                    <FilterPanel
                      filters={filters}
                      setFilters={setFilters}
                      onApply={() => setActiveFilters(filters)}
                      onReset={() => { setFilters(DEFAULT_FILTERS); setActiveFilters(DEFAULT_FILTERS); }}
                    />
                  </SheetContent>
                </Sheet>

                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger className="w-40 rounded-xl border-[#E2E8F0] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_asc">Lowest Price</SelectItem>
                    <SelectItem value="price_desc">Highest Price</SelectItem>
                    <SelectItem value="surface">Largest Surface</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center">
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="text-[#1F2937] font-semibold mb-1">No properties found</h3>
                <p className="text-[#64748B] text-sm">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((e) => <PropertyCard key={e.id} estate={e} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExplorePageInner />
    </Suspense>
  );
}
