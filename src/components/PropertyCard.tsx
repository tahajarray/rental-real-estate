"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bookmark, Bed, Bath, Maximize2, Car, Sofa, Eye, Scale } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEstates, type Estate, MAX_COMPARE } from "../context/EstatesContext";
import { useAuth } from "../context/AuthContext";

const TYPE_LABELS: Record<Estate["type"], string> = {
  apartment: "Apartment",
  house: "House",
  studio: "Studio",
  villa: "Villa",
};

const TYPE_COLORS: Record<Estate["type"], string> = {
  apartment: "bg-[#EFF6FF] text-[#2563EB]",
  house: "bg-[#ECFDF5] text-[#10B981]",
  studio: "bg-[#FFF7ED] text-[#F59E0B]",
  villa: "bg-[#F5F3FF] text-[#8B5CF6]",
};

const STATUS_LABELS: Record<Estate["status"], string> = {
  active: "",
  rented: "Rented",
  sold: "Sold",
};

function formatPrice(estate: Estate) {
  const amount = estate.price.toLocaleString();
  return estate.listingPurpose === "rent" ? (
    <>
      {amount}<span className="text-xs font-normal opacity-90"> DT/mo</span>
    </>
  ) : (
    <>{amount}<span className="text-xs font-normal opacity-90"> DT</span></>
  );
}

export function PropertyCard({ estate }: { estate: Estate }) {
  const router = useRouter();
  const { savedIds, toggleSave, compareIds, toggleCompare } = useEstates();
  const { user } = useAuth();
  const [imgIdx] = useState(0);
  const [limitMsg, setLimitMsg] = useState(false);

  const isSaved = savedIds.includes(estate.id);
  const isComparing = compareIds.includes(estate.id);
  const isUnavailable = estate.status !== "active";

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    toggleSave(estate.id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = toggleCompare(estate.id);
    if (!ok) {
      setLimitMsg(true);
      setTimeout(() => setLimitMsg(false), 2000);
    }
  };

  return (
    <div
      onClick={() => router.push(`/estate/${estate.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2563EB]/10"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <ImageWithFallback
          src={estate.images[imgIdx]}
          alt={estate.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[estate.type]}`}>
            {TYPE_LABELS[estate.type]}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-[#1F2937]">
            {estate.listingPurpose === "rent" ? "For Rent" : "For Sale"}
          </span>
          {isUnavailable && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#EF4444]">
              {STATUS_LABELS[estate.status]}
            </span>
          )}
        </div>
        {/* Save + Compare buttons */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          <button
            onClick={handleSave}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
              isSaved
                ? "bg-[#2563EB] text-white"
                : "bg-white/90 text-[#64748B] hover:bg-white hover:text-[#2563EB]"
            }`}
          >
            <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleCompare}
            title={isComparing ? "Remove from comparison" : "Add to comparison"}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
              isComparing
                ? "bg-[#8B5CF6] text-white"
                : "bg-white/90 text-[#64748B] hover:bg-white hover:text-[#8B5CF6]"
            }`}
          >
            <Scale size={14} />
          </button>
          {limitMsg && (
            <div className="bg-[#1F2937] text-white text-[0.7rem] px-2 py-1 rounded-lg shadow-lg whitespace-nowrap">
              Max {MAX_COMPARE} properties
            </div>
          )}
        </div>
        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-[#10B981] text-white px-3 py-1 rounded-full font-semibold shadow-lg" style={{ fontSize: "0.9rem" }}>
            {formatPrice(estate)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[#1F2937] mb-1 line-clamp-1 group-hover:text-[#2563EB] transition-colors" style={{ fontSize: "0.95rem" }}>
          {estate.title}
        </h3>
        <div className="flex items-center gap-1 text-[#64748B] mb-3" style={{ fontSize: "0.8rem" }}>
          <span>{estate.governorate}</span>
          <span>·</span>
          <span>{estate.zone}</span>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 text-[#64748B]" style={{ fontSize: "0.78rem" }}>
          <span className="flex items-center gap-1">
            <Bed size={13} className="text-[#94A3B8]" /> {estate.rooms} bd
          </span>
          <span className="flex items-center gap-1">
            <Bath size={13} className="text-[#94A3B8]" /> {estate.bathrooms} ba
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 size={13} className="text-[#94A3B8]" /> {estate.surface}m²
          </span>
          {estate.parking && (
            <span className="flex items-center gap-1">
              <Car size={13} className="text-[#94A3B8]" /> Park
            </span>
          )}
          {estate.furnished && (
            <span className="flex items-center gap-1">
              <Sofa size={13} className="text-[#94A3B8]" /> Furn.
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-1 text-[#94A3B8]" style={{ fontSize: "0.75rem" }}>
            <Eye size={12} /> {estate.views} views
          </div>
          <Button
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg h-7 px-3"
            style={{ fontSize: "0.78rem" }}
            onClick={(e) => { e.stopPropagation(); router.push(`/estate/${estate.id}`); }}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
