"use client";

import { useRouter, usePathname } from "next/navigation";
import { X, Scale } from "lucide-react";
import { useEstates, MAX_COMPARE } from "@/context/EstatesContext";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

export function CompareBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { compareIds, estates, toggleCompare, clearCompare } = useEstates();

  if (compareIds.length === 0 || pathname === "/compare") return null;

  const selected = compareIds
    .map((id) => estates.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center">
            <Scale size={16} />
          </div>
          <span className="text-[#1F2937] text-sm font-semibold hidden sm:inline">
            Compare ({selected.length}/{MAX_COMPARE})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {selected.map((estate) => (
            <div
              key={estate.id}
              className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-1 pr-2 py-1 flex-shrink-0"
            >
              <ImageWithFallback
                src={estate.images[0]}
                alt={estate.title}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs text-[#374151] max-w-[100px] truncate">{estate.title}</span>
              <button
                onClick={() => toggleCompare(estate.id)}
                className="text-[#94A3B8] hover:text-[#EF4444] transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearCompare}
            className="text-[#64748B] hover:text-[#EF4444] text-sm px-2 py-2 transition-colors"
          >
            Clear
          </button>
          <button
            disabled={selected.length < 2}
            onClick={() => router.push("/compare")}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#94A3B8] disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl px-4 py-2 transition-colors"
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
}
