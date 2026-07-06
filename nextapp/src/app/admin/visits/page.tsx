"use client";
import { AdminRoute } from "@/components/ProtectedRoute";

import { useState } from "react";
import { Plus, Trash2, CalendarClock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEstates } from "@/context/EstatesContext";

function AdminVisitsPage() {
  const { estates, addVisitSlot, removeVisitSlot } = useEstates();
  const [selectedId, setSelectedId] = useState<string>(estates[0]?.id || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const selected = estates.find((e) => e.id === selectedId);

  const handleAdd = () => {
    if (!selectedId || !date || !startTime || !endTime) return;
    addVisitSlot(selectedId, { date, startTime, endTime });
    setDate(""); setStartTime(""); setEndTime("");
  };

  const removeSlot = (slotId: string) => {
    if (!selected) return;
    removeVisitSlot(selected.id, slotId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[#1F2937] font-bold flex items-center gap-2" style={{ fontSize: "1.75rem" }}>
            <CalendarClock size={26} className="text-[#2563EB]" /> Visit Slots
          </h1>
          <p className="text-[#64748B] text-sm mt-1">Set available visit times for each property</p>
        </div>

        {/* Property picker */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-6">
          <Label className="text-sm font-semibold text-[#1F2937] mb-2 block">Property</Label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="rounded-xl border-[#E2E8F0] h-11">
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {estates.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected && (
          <>
            {/* Add slot form */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-6">
              <h3 className="font-semibold text-[#1F2937] mb-4">Add a new slot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-[#64748B] mb-1 block">Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border-[#E2E8F0]" />
                </div>
                <div>
                  <Label className="text-xs text-[#64748B] mb-1 block">Start</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl border-[#E2E8F0]" />
                </div>
                <div>
                  <Label className="text-xs text-[#64748B] mb-1 block">End</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl border-[#E2E8F0]" />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAdd} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl flex items-center gap-1.5">
                    <Plus size={15} /> Add Slot
                  </Button>
                </div>
              </div>
            </div>

            {/* Existing slots */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <h2 className="font-semibold text-[#1F2937]">Slots for {selected.title}</h2>
              </div>
              {selected.visitSlots.length === 0 ? (
                <div className="p-10 text-center text-[#64748B] text-sm">No visit slots yet — add one above.</div>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {selected.visitSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                          <Clock size={16} className="text-[#2563EB]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#1F2937]">{slot.date}</div>
                          <div className="text-xs text-[#64748B]">{slot.startTime} – {slot.endTime}</div>
                          {slot.isBooked && slot.bookedByName && (
                            <div className="text-xs text-[#2563EB] mt-0.5">Booked by {slot.bookedByName}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          slot.isBooked ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#ECFDF5] text-[#10B981]"
                        }`}>
                          {slot.isBooked ? "Booked" : "Open"}
                        </span>
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#EF4444] hover:border-[#FCA5A5]"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function admin_visits_Guard() {
  return (
    <AdminRoute>
      <AdminVisitsPage />
    </AdminRoute>
  );
}
