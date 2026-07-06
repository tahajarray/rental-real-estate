"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { useEstates } from "@/context/EstatesContext";

function SavedPage() {
  const router = useRouter();
  const { estates, savedIds } = useEstates();
  const saved = estates.filter((e) => savedIds.includes(e.id));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[#1F2937] font-bold" style={{ fontSize: "1.75rem" }}>Saved Properties</h1>
          <p className="text-[#64748B] text-sm mt-1">{saved.length} saved {saved.length === 1 ? "property" : "properties"}</p>
        </div>

        {saved.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center">
            <Bookmark size={40} className="text-[#CBD5E1] mx-auto mb-4" />
            <h3 className="text-[#1F2937] font-semibold mb-1">No saved properties</h3>
            <p className="text-[#64748B] text-sm mb-5">Bookmark properties to revisit them later</p>
            <Button onClick={() => router.push("/explore")} className="bg-[#2563EB] text-white rounded-xl">
              Explore Properties
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {saved.map((e) => <PropertyCard key={e.id} estate={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function saved_Guard() {
  return (
    <ProtectedRoute>
      <SavedPage />
    </ProtectedRoute>
  );
}
