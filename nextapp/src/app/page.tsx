"use client";

import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, Star, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { useEstates } from "@/context/EstatesContext";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

const CITIES = [
  { name: "Tunis", count: 1240, image: "https://images.unsplash.com/photo-1596395463119-15a2ec6dcb1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400" },
  { name: "Sousse", count: 584, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400" },
  { name: "Sfax", count: 392, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400" },
  { name: "Nabeul", count: 467, image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400" },
  { name: "Monastir", count: 289, image: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400" },
  { name: "Ariana", count: 213, image: "https://images.unsplash.com/photo-1524396309943-e03f5249f002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400" },
];

const STATS = [
  { value: "10K+", label: "Properties Listed" },
  { value: "24", label: "Governorates Covered" },
  { value: "25K+", label: "Happy Users" },
  { value: "4.9★", label: "Average Rating" },
];

function HomePage() {
  const router = useRouter();
  const { estates } = useEstates();

  const active = estates.filter((e) => e.status === "active");
  const featured = [...active].sort((a, b) => b.savesCount - a.savesCount).slice(0, 4);
  const newest = [...active].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const recommended = [...active].sort((a, b) => b.views - a.views).slice(4, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1596395463119-15a2ec6dcb1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
          alt="Modern properties in Tunisia"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/85 via-[#0F172A]/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
              <Star size={14} className="text-[#F59E0B] fill-current" />
              <span className="text-white text-sm font-medium">Trusted across Tunisia</span>
            </div>

            <h1 className="text-white mb-4 leading-tight" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800 }}>
              Find Your<br />
              <span className="text-[#F59E0B]">Perfect</span> Home in Tunisia
            </h1>

            <p className="text-white/80 mb-10 leading-relaxed" style={{ fontSize: "1.1rem" }}>
              Thousands of apartments, villas, and houses for rent or sale across every governorate in Tunisia.
            </p>

            <SearchBar />

            <div className="flex flex-wrap gap-4 mt-8">
              {["Rent or buy", "Verified listings", "Direct contact"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-white/70 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats float */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-t-2xl shadow-xl grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E2E8F0] overflow-hidden">
              {STATS.map((s) => (
                <div key={s.value} className="px-6 py-4 text-center">
                  <div className="text-[#2563EB] font-bold" style={{ fontSize: "1.4rem" }}>{s.value}</div>
                  <div className="text-[#64748B] text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#2563EB] text-sm font-semibold mb-2">
                <Star size={15} className="fill-current" /> Featured Properties
              </div>
              <h2 className="text-[#1F2937]" style={{ fontSize: "1.75rem", fontWeight: 700 }}>Top Picks This Week</h2>
            </div>
            <Button variant="ghost" onClick={() => router.push("/explore")} className="text-[#2563EB] hover:text-[#1D4ED8] hidden sm:flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((e) => <PropertyCard key={e.id} estate={e} />)}
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-[#2563EB] text-sm font-semibold mb-2">
              <MapPin size={15} /> Popular Locations
            </div>
            <h2 className="text-[#1F2937]" style={{ fontSize: "1.75rem", fontWeight: 700 }}>Explore by Governorate</h2>
            <p className="text-[#64748B] mt-2 text-sm">Discover the best properties across Tunisia's top governorates</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => router.push(`/explore?city=${city.name}`)}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
              >
                <ImageWithFallback
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <div className="text-white font-semibold text-sm">{city.name}</div>
                  <div className="text-white/70 text-xs">{city.count.toLocaleString()} listings</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newest Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#10B981] text-sm font-semibold mb-2">
                <TrendingUp size={15} /> Newest Listings
              </div>
              <h2 className="text-[#1F2937]" style={{ fontSize: "1.75rem", fontWeight: 700 }}>Just Added</h2>
            </div>
            <Button variant="ghost" onClick={() => router.push("/explore")} className="text-[#2563EB] hover:text-[#1D4ED8] hidden sm:flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newest.map((e) => <PropertyCard key={e.id} estate={e} />)}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-[#2563EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-5">
            <Sparkles size={14} className="text-[#F59E0B]" />
            <span className="text-white text-sm">Looking for something specific?</span>
          </div>
          <h2 className="text-white mb-3" style={{ fontSize: "2rem", fontWeight: 700 }}>
            Can't Find What You're Looking For?
          </h2>
          <p className="text-white/80 mb-7 text-sm leading-relaxed max-w-lg mx-auto">
            Get in touch and tell us what you need — we'll help you find the right property to rent or buy in Tunisia.
          </p>
          <Button
            onClick={() => router.push("/contact")}
            className="bg-white text-[#2563EB] hover:bg-[#F8FAFC] rounded-xl px-8 py-3 h-auto font-semibold flex items-center gap-2 mx-auto"
          >
            Contact Us <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* Recommended */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#F59E0B] text-sm font-semibold mb-2">
                <Sparkles size={15} /> Recommended
              </div>
              <h2 className="text-[#1F2937]" style={{ fontSize: "1.75rem", fontWeight: 700 }}>Recommended For You</h2>
            </div>
            <Button variant="ghost" onClick={() => router.push("/explore")} className="text-[#2563EB] hover:text-[#1D4ED8] hidden sm:flex items-center gap-1">
              Explore All <ChevronRight size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommended.map((e) => <PropertyCard key={e.id} estate={e} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
