"use client";
import { AdminRoute } from "@/components/ProtectedRoute";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Bookmark, BarChart3, Building2, CheckCircle, DollarSign, CalendarClock, CalendarCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { useEstates, type Estate } from "@/context/EstatesContext";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const STATUS_LABELS: Record<Estate["status"], string> = {
  active: "Active",
  rented: "Rented",
  sold: "Sold",
};

const STATUS_COLORS: Record<Estate["status"], string> = {
  active: "bg-[#ECFDF5] text-[#10B981]",
  rented: "bg-[#FEF2F2] text-[#EF4444]",
  sold: "bg-[#F5F3FF] text-[#8B5CF6]",
};

function AdminDashboard() {
  const router = useRouter();
  const { estates, deleteEstate, updateEstate, bookings } = useEstates();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const stats = {
    total: estates.length,
    active: estates.filter((e) => e.status === "active").length,
    views: estates.reduce((a, e) => a + e.views, 0),
    saves: estates.reduce((a, e) => a + e.savesCount, 0),
  };

  const STAT_CARDS = [
    { label: "Total Listings", value: stats.total, icon: Building2, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Active", value: stats.active, icon: CheckCircle, color: "#10B981", bg: "#ECFDF5" },
    { label: "Total Views", value: stats.views.toLocaleString(), icon: Eye, color: "#F59E0B", bg: "#FFF7ED" },
    { label: "Saved by users", value: stats.saves, icon: Bookmark, color: "#8B5CF6", bg: "#F5F3FF" },
  ];

  const nextStatus = (estate: Estate): Estate["status"] =>
    estate.status === "active" ? (estate.listingPurpose === "rent" ? "rented" : "sold") : "active";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-[#1F2937] font-bold" style={{ fontSize: "1.75rem" }}>Admin Dashboard</h1>
            <p className="text-[#64748B] text-sm mt-1">Manage all property listings</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/admin/visits")}
              variant="outline"
              className="rounded-xl border-[#E2E8F0] flex items-center gap-2"
            >
              <CalendarClock size={16} /> Visit Slots
            </Button>
            <Button
              onClick={() => router.push("/admin/add-estate")}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl flex items-center gap-2"
            >
              <Plus size={16} /> Add Property
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <div className="font-bold text-[#1F2937]" style={{ fontSize: "1.4rem" }}>{value}</div>
              <div className="text-[#64748B] text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Recent Bookings — makes it immediately visible to the admin whenever
            a user books a visit, without digging through each property. */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
            <CalendarCheck size={17} className="text-[#2563EB]" />
            <h2 className="font-semibold text-[#1F2937]">Recent Bookings {bookings.length > 0 && `(${bookings.length})`}</h2>
          </div>
          {bookings.length === 0 ? (
            <div className="px-5 py-8 text-center text-[#94A3B8] text-sm">No visits booked yet.</div>
          ) : (
            <div className="divide-y divide-[#F1F5F9] max-h-80 overflow-y-auto">
              {bookings.map((b) => (
                <button
                  key={b.slotId}
                  onClick={() => router.push("/admin/visits")}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                    <UserRound size={16} className="text-[#2563EB]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#1F2937]">
                      <span className="font-medium">{b.userName}</span> booked a visit
                    </p>
                    <p className="text-xs text-[#64748B] truncate">{b.estateTitle}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-[#1F2937] font-medium">
                      {new Date(b.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {b.startTime}
                    </div>
                    <div className="text-[#94A3B8]" style={{ fontSize: "0.7rem" }}>{timeAgo(b.bookedAt)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listings */}
        {estates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center">
            <Building2 size={40} className="text-[#CBD5E1] mx-auto mb-4" />
            <h3 className="text-[#1F2937] font-semibold mb-1">No properties yet</h3>
            <p className="text-[#64748B] text-sm mb-5">Add your first property listing</p>
            <Button onClick={() => router.push("/admin/add-estate")} className="bg-[#2563EB] text-white rounded-xl">
              <Plus size={15} className="mr-2" /> Add Your First Property
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-semibold text-[#1F2937]">All Listings ({estates.length})</h2>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {estates.map((estate) => (
                <div key={estate.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                  {/* Thumbnail */}
                  <div
                    className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => router.push(`/estate/${estate.id}`)}
                  >
                    <ImageWithFallback src={estate.images[0]} alt={estate.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className="font-medium text-[#1F2937] text-sm cursor-pointer hover:text-[#2563EB] truncate"
                        onClick={() => router.push(`/estate/${estate.id}`)}
                      >
                        {estate.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B]">
                        {estate.listingPurpose === "rent" ? "Rent" : "Sale"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[estate.status]}`}>
                        {STATUS_LABELS[estate.status]}
                      </span>
                    </div>
                    <div className="text-[#64748B] text-xs mt-0.5">
                      {estate.governorate} · {estate.price.toLocaleString()} DT{estate.listingPurpose === "rent" ? "/mo" : ""} · {estate.surface}m²
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[#94A3B8]" style={{ fontSize: "0.72rem" }}>
                      <span className="flex items-center gap-1"><Eye size={11} /> {estate.views}</span>
                      <span className="flex items-center gap-1"><Bookmark size={11} /> {estate.savesCount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateEstate(estate.id, { status: nextStatus(estate) })}
                      className="rounded-lg border-[#E2E8F0] h-8 px-2.5 text-xs hidden sm:flex items-center gap-1"
                    >
                      {estate.status === "active" ? <DollarSign size={12} /> : <CheckCircle size={12} />}
                      {estate.status === "active"
                        ? (estate.listingPurpose === "rent" ? "Mark Rented" : "Mark Sold")
                        : "Mark Active"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/estate/${estate.id}`)}
                      className="rounded-lg border-[#E2E8F0] h-8 w-8 p-0"
                    >
                      <Eye size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(estate.id)}
                      className="rounded-lg border-[#E2E8F0] h-8 w-8 p-0 text-[#EF4444] hover:text-[#EF4444] hover:border-[#FCA5A5]"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="rounded-2xl border border-[#E2E8F0]">
            <DialogHeader>
              <DialogTitle>Delete Property</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this listing? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl">Cancel</Button>
              <Button
                onClick={() => { if (deleteId) { deleteEstate(deleteId); setDeleteId(null); } }}
                className="bg-[#EF4444] hover:bg-red-600 text-white rounded-xl"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function admin_Guard() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
