"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ListingPurpose = "rent" | "sale";
export type ListingStatus = "active" | "rented" | "sold";

export interface VisitSlot {
  id: string;
  date: string;      // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;
  isBooked: boolean;
  bookedByUserId?: string;
  bookedByName?: string;
  bookedAt?: string;  // ISO timestamp of when the booking was made
  bookingStatus?: "pending" | "approved";
}

export interface Estate {
  id: string;
  title: string;
  description: string;
  governorate: string;
  zone: string;
  address: string;
  price: number;
  listingPurpose: ListingPurpose;
  status: ListingStatus;
  type: "apartment" | "house" | "studio" | "villa";
  surface: number;
  rooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchen: boolean;
  balcony: boolean;
  floor: number;
  furnished: boolean;
  parking: boolean;
  airConditioner: boolean;
  acUnits: number;
  internet: boolean;
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerVerified: boolean;
  views: number;
  savesCount: number;
  createdAt: string;
  visitSlots: VisitSlot[];
}

export interface Booking {
  estateId: string;
  estateTitle: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
  userName: string;
  bookedAt: string;
  bookingStatus: "pending" | "approved";
}

interface EstatesContextType {
  estates: Estate[];
  savedIds: string[];
  toggleSave: (id: string) => void;
  addEstate: (estate: Omit<Estate, "id" | "createdAt" | "views" | "savesCount" | "visitSlots">) => void;
  deleteEstate: (id: string) => void;
  updateEstate: (id: string, data: Partial<Estate>) => void;
  getEstate: (id: string) => Estate | undefined;
  addVisitSlot: (estateId: string, slot: Omit<VisitSlot, "id" | "isBooked">) => void;
  removeVisitSlot: (estateId: string, slotId: string) => void;
  bookVisitSlot: (estateId: string, slotId: string, userId: string, userName: string) => boolean;
  /** Worker/admin confirms a requested visit; caller is responsible for notifying the user. */
  approveBooking: (estateId: string, slotId: string) => void;
  /** Removes a booking entirely (e.g. after the visit happened) — frees the slot. */
  deleteBooking: (estateId: string, slotId: string) => void;
  /** All booked visit slots across every property, most recent first — this is
   * what powers the worker "Recent Bookings" view, computed straight from the
   * shared estates data so it can never drift out of sync. */
  bookings: Booking[];
  /** Ids of properties currently selected for side-by-side comparison. Capped
   * at MAX_COMPARE — same "toggle a ceiling'd list" shape as savedIds. */
  compareIds: string[];
  toggleCompare: (id: string) => boolean;
  clearCompare: () => void;
}

export const MAX_COMPARE = 3;

const EstatesContext = createContext<EstatesContextType | null>(null);

const ESTATES_KEY = "re_estates";
const SAVED_KEY = "re_saved";
const COMPARE_KEY = "re_compare";

const WORKER = {
  ownerId: "worker-1",
  ownerName: "NestFinder Tunisia",
  ownerAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
  ownerVerified: true,
};

const IMAGES = [
  "https://images.unsplash.com/photo-1564078516393-cf04bd966897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
];

function slots(estateId: string): VisitSlot[] {
  const today = new Date();
  const mk = (offsetDays: number, start: string, end: string, booked = false): VisitSlot => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return {
      id: `${estateId}-slot-${offsetDays}-${start}`,
      date: d.toISOString().slice(0, 10),
      startTime: start,
      endTime: end,
      isBooked: booked,
    };
  };
  return [
    mk(2, "10:00", "10:30"),
    mk(2, "14:00", "14:30", true),
    mk(3, "09:00", "09:30"),
    mk(4, "11:00", "11:30"),
  ];
}

const MOCK_ESTATES: Estate[] = [
  {
    id: "e1",
    title: "Modern Apartment in Les Berges du Lac",
    description: "A stunning modern apartment in Tunis's premier business district. Floor-to-ceiling windows, premium finishes, and lake views. Recently renovated with top-of-the-line appliances.",
    governorate: "Tunis",
    zone: "Les Berges du Lac",
    address: "Rue du Lac Windermere",
    price: 1800,
    listingPurpose: "rent",
    status: "active",
    type: "apartment",
    surface: 110,
    rooms: 3,
    bathrooms: 2,
    livingRooms: 1,
    kitchen: true,
    balcony: true,
    floor: 4,
    furnished: true,
    parking: true,
    airConditioner: true,
    acUnits: 3,
    internet: true,
    images: IMAGES,
    ...WORKER,
    views: 342,
    savesCount: 28,
    createdAt: "2026-06-15",
    visitSlots: slots("e1"),
  },
  {
    id: "e2",
    title: "Family Villa with Pool in La Marsa",
    description: "Spacious villa near the coast in La Marsa, featuring a private pool, garden, and garage. Perfect for families looking for space and tranquility close to Tunis.",
    governorate: "Tunis",
    zone: "La Marsa",
    address: "Avenue Habib Bourguiba",
    price: 950000,
    listingPurpose: "sale",
    status: "active",
    type: "villa",
    surface: 320,
    rooms: 5,
    bathrooms: 4,
    livingRooms: 2,
    kitchen: true,
    balcony: true,
    floor: 0,
    furnished: false,
    parking: true,
    airConditioner: true,
    acUnits: 5,
    internet: true,
    images: IMAGES,
    ...WORKER,
    views: 512,
    savesCount: 41,
    createdAt: "2026-06-10",
    visitSlots: slots("e2"),
  },
  {
    id: "e3",
    title: "Cozy Studio Near Ariana Centre",
    description: "Compact and efficient studio, ideal for students or young professionals. Walking distance to shops, cafes, and public transport.",
    governorate: "Ariana",
    zone: "Ariana Ville",
    address: "Rue de la Republique",
    price: 550,
    listingPurpose: "rent",
    status: "active",
    type: "studio",
    surface: 35,
    rooms: 1,
    bathrooms: 1,
    livingRooms: 0,
    kitchen: true,
    balcony: false,
    floor: 2,
    furnished: true,
    parking: false,
    airConditioner: true,
    acUnits: 1,
    internet: true,
    images: IMAGES,
    ...WORKER,
    views: 198,
    savesCount: 12,
    createdAt: "2026-06-20",
    visitSlots: slots("e3"),
  },
  {
    id: "e4",
    title: "Beachfront Apartment in Sousse",
    description: "Wake up to sea views every morning. This beachfront apartment in Sousse offers direct beach access and a large terrace overlooking the Mediterranean.",
    governorate: "Sousse",
    zone: "Sousse Corniche",
    address: "Boulevard 14 Janvier",
    price: 620000,
    listingPurpose: "sale",
    status: "active",
    type: "apartment",
    surface: 140,
    rooms: 3,
    bathrooms: 2,
    livingRooms: 1,
    kitchen: true,
    balcony: true,
    floor: 3,
    furnished: false,
    parking: true,
    airConditioner: true,
    acUnits: 2,
    internet: true,
    images: IMAGES,
    ...WORKER,
    views: 276,
    savesCount: 19,
    createdAt: "2026-06-18",
    visitSlots: slots("e4"),
  },
  {
    id: "e5",
    title: "Traditional House in Sfax Medina",
    description: "Charming traditional Tunisian house near the Medina of Sfax, with an interior courtyard and authentic architectural details.",
    governorate: "Sfax",
    zone: "Medina",
    address: "Rue Bab Diwan",
    price: 480,
    listingPurpose: "rent",
    status: "rented",
    type: "house",
    surface: 180,
    rooms: 4,
    bathrooms: 2,
    livingRooms: 1,
    kitchen: true,
    balcony: false,
    floor: 0,
    furnished: true,
    parking: false,
    airConditioner: false,
    acUnits: 0,
    internet: true,
    images: IMAGES,
    ...WORKER,
    views: 154,
    savesCount: 8,
    createdAt: "2026-05-30",
    visitSlots: slots("e5"),
  },
  {
    id: "e6",
    title: "New-Build Duplex in Ennasr",
    description: "Brand-new duplex apartment in the sought-after Ennasr neighborhood, close to universities and shopping centers.",
    governorate: "Ariana",
    zone: "Ennasr",
    address: "Rue du Lac Leman",
    price: 720000,
    listingPurpose: "sale",
    status: "sold",
    type: "apartment",
    surface: 160,
    rooms: 4,
    bathrooms: 3,
    livingRooms: 1,
    kitchen: true,
    balcony: true,
    floor: 5,
    furnished: false,
    parking: true,
    airConditioner: true,
    acUnits: 3,
    internet: true,
    images: IMAGES,
    ...WORKER,
    views: 401,
    savesCount: 33,
    createdAt: "2026-05-22",
    visitSlots: slots("e6"),
  },
  {
    id: "e7",
    title: "Seaside Villa in Hammamet",
    description: "Elegant villa a short walk from Hammamet's beaches, with a private garden and outdoor dining area — perfect for a holiday home.",
    governorate: "Nabeul",
    zone: "Hammamet",
    address: "Route Touristique",
    price: 1400,
    listingPurpose: "rent",
    status: "active",
    type: "villa",
    surface: 250,
    rooms: 4,
    bathrooms: 3,
    livingRooms: 2,
    kitchen: true,
    balcony: true,
    floor: 0,
    furnished: true,
    parking: true,
    airConditioner: true,
    acUnits: 4,
    internet: true,
    images: IMAGES,
    ...WORKER,
    views: 289,
    savesCount: 22,
    createdAt: "2026-06-25",
    visitSlots: slots("e7"),
  },
  {
    id: "e8",
    title: "Modern Apartment in Monastir Centre",
    description: "Bright and modern apartment near Monastir's marina, with easy access to the airport and city center amenities.",
    governorate: "Monastir",
    zone: "Centre Ville",
    address: "Avenue de la Corniche",
    price: 395000,
    listingPurpose: "sale",
    status: "active",
    type: "apartment",
    surface: 95,
    rooms: 2,
    bathrooms: 1,
    livingRooms: 1,
    kitchen: true,
    balcony: true,
    floor: 2,
    furnished: false,
    parking: true,
    airConditioner: true,
    acUnits: 2,
    internet: true,
    images: IMAGES,
    ...WORKER,
    views: 167,
    savesCount: 11,
    createdAt: "2026-06-12",
    visitSlots: slots("e8"),
  },
];

// --- localStorage helpers -------------------------------------------------
// There's no backend here: these read/write straight to localStorage so that
// (a) worker edits and bookings survive a page refresh, and (b) other tabs on
// the same browser pick up changes via the native `storage` event, which is
// what makes "someone else booked this slot" actually show up live.

function readEstates(): Estate[] {
  if (typeof window === "undefined") return MOCK_ESTATES;
  try {
    const raw = window.localStorage.getItem(ESTATES_KEY);
    if (!raw) return MOCK_ESTATES;
    return JSON.parse(raw) as Estate[];
  } catch {
    return MOCK_ESTATES;
  }
}

function writeEstates(next: Estate[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ESTATES_KEY, JSON.stringify(next));
}

export function EstatesProvider({ children }: { children: React.ReactNode }) {
  const [estates, setEstates] = useState<Estate[]>(MOCK_ESTATES);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Initial load (and first-time seed) from localStorage.
  useEffect(() => {
    const storedEstates = window.localStorage.getItem(ESTATES_KEY);
    if (storedEstates) {
      setEstates(readEstates());
    } else {
      writeEstates(MOCK_ESTATES);
    }

    const storedSaved = window.localStorage.getItem(SAVED_KEY);
    if (storedSaved) setSavedIds(JSON.parse(storedSaved));

    const storedCompare = window.localStorage.getItem(COMPARE_KEY);
    if (storedCompare) setCompareIds(JSON.parse(storedCompare));
  }, []);

  // Pick up changes made in other tabs/windows on the same browser — this is
  // what makes a booking made as a user show up live on the worker side.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === ESTATES_KEY) setEstates(readEstates());
      if (e.key === SAVED_KEY) {
        try {
          setSavedIds(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          // ignore malformed value
        }
      }
      if (e.key === COMPARE_KEY) {
        try {
          setCompareIds(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          // ignore malformed value
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // The compare list is a "current session" concern, not something that
  // should follow whoever happens to log in next on this browser — clear it
  // whenever any account logs out, regardless of which button triggered it.
  useEffect(() => {
    function onLogout() {
      setCompareIds([]);
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify([]));
    }
    window.addEventListener("nestfinder:logout", onLogout);
    return () => window.removeEventListener("nestfinder:logout", onLogout);
  }, []);

  const commitEstates = useCallback((next: Estate[]) => {
    setEstates(next);
    writeEstates(next);
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Returns false (and leaves the list untouched) when trying to add a 4th
  // property past MAX_COMPARE, so the UI can show a "max reached" message.
  const toggleCompare = (id: string): boolean => {
    let didAdd = true;
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((c) => c !== id);
        window.localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
        didAdd = true;
        return next;
      }
      if (prev.length >= MAX_COMPARE) {
        didAdd = false;
        return prev;
      }
      const next = [...prev, id];
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
    return didAdd;
  };

  const clearCompare = () => {
    setCompareIds([]);
    window.localStorage.setItem(COMPARE_KEY, JSON.stringify([]));
  };

  const addEstate: EstatesContextType["addEstate"] = (estate) => {
    const newEstate: Estate = {
      ...estate,
      id: `e${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      views: 0,
      savesCount: 0,
      visitSlots: [],
    };
    commitEstates([newEstate, ...readEstates()]);
  };

  const deleteEstate = (id: string) => {
    commitEstates(readEstates().filter((e) => e.id !== id));
  };

  const updateEstate = (id: string, data: Partial<Estate>) => {
    commitEstates(readEstates().map((e) => (e.id === id ? { ...e, ...data } : e)));
  };

  const getEstate = (id: string) => estates.find((e) => e.id === id);

  const addVisitSlot: EstatesContextType["addVisitSlot"] = (estateId, slot) => {
    const next = readEstates().map((e) =>
      e.id === estateId
        ? { ...e, visitSlots: [...e.visitSlots, { ...slot, id: `${estateId}-slot-${Date.now()}`, isBooked: false }] }
        : e
    );
    commitEstates(next);
  };

  const removeVisitSlot = (estateId: string, slotId: string) => {
    const next = readEstates().map((e) =>
      e.id === estateId ? { ...e, visitSlots: e.visitSlots.filter((s) => s.id !== slotId) } : e
    );
    commitEstates(next);
  };

  // Returns false if the slot is no longer available (already booked by
  // someone else — including in another tab), so the UI can tell the user.
  const bookVisitSlot = (estateId: string, slotId: string, userId: string, userName: string): boolean => {
    const latest = readEstates();
    const estate = latest.find((e) => e.id === estateId);
    const slot = estate?.visitSlots.find((s) => s.id === slotId);
    if (!estate || !slot || slot.isBooked) return false;

    const bookedAt = new Date().toISOString();
    const nextEstates = latest.map((e) =>
      e.id === estateId
        ? {
            ...e,
            visitSlots: e.visitSlots.map((s) =>
              s.id === slotId
                ? { ...s, isBooked: true, bookedByUserId: userId, bookedByName: userName, bookedAt, bookingStatus: "pending" as const }
                : s
            ),
          }
        : e
    );
    commitEstates(nextEstates);

    return true;
  };

  const approveBooking = (estateId: string, slotId: string) => {
    const next = readEstates().map((e) =>
      e.id === estateId
        ? { ...e, visitSlots: e.visitSlots.map((s) => (s.id === slotId ? { ...s, bookingStatus: "approved" as const } : s)) }
        : e
    );
    commitEstates(next);
  };

  // Removing the slot entirely both frees it up and clears the booking from
  // the worker's list — appropriate once the visit has happened (or been cancelled).
  const deleteBooking = (estateId: string, slotId: string) => {
    removeVisitSlot(estateId, slotId);
  };

  // Derived straight from the estates data (single source of truth) so the
  // worker side always reflects exactly what users have booked — no separate
  // notification store to fall out of sync.
  const bookings: Booking[] = estates
    .flatMap((e) =>
      e.visitSlots
        .filter((s) => s.isBooked && s.bookedByName)
        .map((s) => ({
          estateId: e.id,
          estateTitle: e.title,
          slotId: s.id,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          userId: s.bookedByUserId || "",
          userName: s.bookedByName as string,
          bookedAt: s.bookedAt || s.date,
          bookingStatus: s.bookingStatus || "pending",
        }))
    )
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());

  return (
    <EstatesContext.Provider
      value={{
        estates,
        savedIds,
        toggleSave,
        addEstate,
        deleteEstate,
        updateEstate,
        getEstate,
        addVisitSlot,
        removeVisitSlot,
        bookVisitSlot,
        approveBooking,
        deleteBooking,
        bookings,
        compareIds,
        toggleCompare,
        clearCompare,
      }}
    >
      {children}
    </EstatesContext.Provider>
  );
}

export function useEstates() {
  const ctx = useContext(EstatesContext);
  if (!ctx) throw new Error("useEstates must be used within EstatesProvider");
  return ctx;
}
