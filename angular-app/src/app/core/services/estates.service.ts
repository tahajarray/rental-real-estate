import { Injectable, computed, signal } from '@angular/core';
import { Booking, Estate, VisitSlot } from '../models';

const ESTATES_KEY = 're_estates';
const SAVED_KEY = 're_saved';
const COMPARE_KEY = 're_compare';
export const MAX_COMPARE = 3;

const WORKER_OWNER = {
  ownerId: 'worker-1',
  ownerName: 'NestFinder Tunisia',
  ownerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face',
  ownerVerified: true,
};

const IMAGES = [
  'https://images.unsplash.com/photo-1564078516393-cf04bd966897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
];

function mkSlots(estateId: string): VisitSlot[] {
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
  return [mk(2, '10:00', '10:30'), mk(2, '14:00', '14:30', true), mk(3, '09:00', '09:30'), mk(4, '11:00', '11:30')];
}

const MOCK_ESTATES: Estate[] = [
  {
    id: 'e1',
    title: 'Modern Apartment in Les Berges du Lac',
    description: 'A stunning modern apartment in Tunis with lake views and premium finishes.',
    governorate: 'Tunis',
    zone: 'Les Berges du Lac',
    address: 'Rue du Lac Windermere',
    price: 1800,
    listingPurpose: 'rent',
    status: 'active',
    type: 'apartment',
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
    ...WORKER_OWNER,
    views: 342,
    savesCount: 28,
    createdAt: '2026-06-15',
    visitSlots: mkSlots('e1'),
  },
  {
    id: 'e2',
    title: 'Family Villa with Pool in La Marsa',
    description: 'Spacious villa near the coast with private pool and garden.',
    governorate: 'Tunis',
    zone: 'La Marsa',
    address: 'Avenue Habib Bourguiba',
    price: 950000,
    listingPurpose: 'sale',
    status: 'active',
    type: 'villa',
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
    ...WORKER_OWNER,
    views: 512,
    savesCount: 41,
    createdAt: '2026-06-10',
    visitSlots: mkSlots('e2'),
  },
  {
    id: 'e3',
    title: 'Cozy Studio Near Ariana Centre',
    description: 'Compact studio ideal for students and young professionals.',
    governorate: 'Ariana',
    zone: 'Ariana Ville',
    address: 'Rue de la Republique',
    price: 550,
    listingPurpose: 'rent',
    status: 'active',
    type: 'studio',
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
    ...WORKER_OWNER,
    views: 198,
    savesCount: 12,
    createdAt: '2026-06-20',
    visitSlots: mkSlots('e3'),
  },
  {
    id: 'e4',
    title: 'Beachfront Apartment in Sousse',
    description: 'Sea views and direct beach access with large terrace.',
    governorate: 'Sousse',
    zone: 'Sousse Corniche',
    address: 'Boulevard 14 Janvier',
    price: 620000,
    listingPurpose: 'sale',
    status: 'active',
    type: 'apartment',
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
    ...WORKER_OWNER,
    views: 276,
    savesCount: 19,
    createdAt: '2026-06-18',
    visitSlots: mkSlots('e4'),
  },
  {
    id: 'e5',
    title: 'Traditional House in Sfax Medina',
    description: 'Traditional Tunisian house with interior courtyard.',
    governorate: 'Sfax',
    zone: 'Medina',
    address: 'Rue Bab Diwan',
    price: 480,
    listingPurpose: 'rent',
    status: 'rented',
    type: 'house',
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
    ...WORKER_OWNER,
    views: 154,
    savesCount: 8,
    createdAt: '2026-05-30',
    visitSlots: mkSlots('e5'),
  },
  {
    id: 'e6',
    title: 'New-Build Duplex in Ennasr',
    description: 'Brand-new duplex in a sought-after area.',
    governorate: 'Ariana',
    zone: 'Ennasr',
    address: 'Rue du Lac Leman',
    price: 720000,
    listingPurpose: 'sale',
    status: 'sold',
    type: 'apartment',
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
    ...WORKER_OWNER,
    views: 401,
    savesCount: 33,
    createdAt: '2026-05-22',
    visitSlots: mkSlots('e6'),
  },
  {
    id: 'e7',
    title: 'Seaside Villa in Hammamet',
    description: 'Elegant villa near Hammamet beaches.',
    governorate: 'Nabeul',
    zone: 'Hammamet',
    address: 'Route Touristique',
    price: 1400,
    listingPurpose: 'rent',
    status: 'active',
    type: 'villa',
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
    ...WORKER_OWNER,
    views: 289,
    savesCount: 22,
    createdAt: '2026-06-25',
    visitSlots: mkSlots('e7'),
  },
  {
    id: 'e8',
    title: 'Modern Apartment in Monastir Centre',
    description: 'Bright apartment near marina and airport.',
    governorate: 'Monastir',
    zone: 'Centre Ville',
    address: 'Avenue de la Corniche',
    price: 395000,
    listingPurpose: 'sale',
    status: 'active',
    type: 'apartment',
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
    ...WORKER_OWNER,
    views: 167,
    savesCount: 11,
    createdAt: '2026-06-12',
    visitSlots: mkSlots('e8'),
  },
];

@Injectable({ providedIn: 'root' })
export class EstatesService {
  private readonly _estates = signal<Estate[]>(MOCK_ESTATES);
  private readonly _savedIds = signal<string[]>([]);
  private readonly _compareIds = signal<string[]>([]);

  readonly estates = this._estates.asReadonly();
  readonly savedIds = this._savedIds.asReadonly();
  readonly compareIds = this._compareIds.asReadonly();

  readonly bookings = computed<Booking[]>(() =>
    this._estates()
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
            userId: s.bookedByUserId || '',
            userName: s.bookedByName || '',
            bookedAt: s.bookedAt || s.date,
            bookingStatus: s.bookingStatus || 'pending',
          }))
      )
      .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
  );

  constructor() {
    this.initialLoad();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => this.onStorage(e));
      window.addEventListener('nestfinder:logout', () => this.clearCompare());
    }
  }

  private readEstates(): Estate[] {
    if (typeof window === 'undefined') return MOCK_ESTATES;
    try {
      const raw = window.localStorage.getItem(ESTATES_KEY);
      return raw ? (JSON.parse(raw) as Estate[]) : MOCK_ESTATES;
    } catch {
      return MOCK_ESTATES;
    }
  }

  private writeEstates(next: Estate[]) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ESTATES_KEY, JSON.stringify(next));
  }

  private initialLoad() {
    if (typeof window === 'undefined') return;
    const storedEstates = window.localStorage.getItem(ESTATES_KEY);
    if (storedEstates) this._estates.set(this.readEstates());
    else this.writeEstates(MOCK_ESTATES);

    const saved = window.localStorage.getItem(SAVED_KEY);
    if (saved) this._savedIds.set(JSON.parse(saved));

    const compare = window.localStorage.getItem(COMPARE_KEY);
    if (compare) this._compareIds.set(JSON.parse(compare));
  }

  private onStorage(e: StorageEvent) {
    if (e.key === ESTATES_KEY) this._estates.set(this.readEstates());
    if (e.key === SAVED_KEY) this._savedIds.set(e.newValue ? JSON.parse(e.newValue) : []);
    if (e.key === COMPARE_KEY) this._compareIds.set(e.newValue ? JSON.parse(e.newValue) : []);
  }

  private commitEstates(next: Estate[]) {
    this._estates.set(next);
    this.writeEstates(next);
  }

  getEstate(id: string) {
    return this._estates().find((e) => e.id === id);
  }

  toggleSave(id: string) {
    const next = this._savedIds().includes(id)
      ? this._savedIds().filter((s) => s !== id)
      : [...this._savedIds(), id];
    this._savedIds.set(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  }

  toggleCompare(id: string): boolean {
    const current = this._compareIds();
    if (current.includes(id)) {
      const next = current.filter((c) => c !== id);
      this._compareIds.set(next);
      if (typeof window !== 'undefined') window.localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return true;
    }
    if (current.length >= MAX_COMPARE) return false;
    const next = [...current, id];
    this._compareIds.set(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
    return true;
  }

  clearCompare() {
    this._compareIds.set([]);
    if (typeof window !== 'undefined') window.localStorage.setItem(COMPARE_KEY, JSON.stringify([]));
  }

  addEstate(estate: Omit<Estate, 'id' | 'createdAt' | 'views' | 'savesCount' | 'visitSlots'>) {
    const newEstate: Estate = {
      ...estate,
      id: `e${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      views: 0,
      savesCount: 0,
      visitSlots: [],
    };
    this.commitEstates([newEstate, ...this.readEstates()]);
  }

  updateEstate(id: string, data: Partial<Estate>) {
    this.commitEstates(this.readEstates().map((e) => (e.id === id ? { ...e, ...data } : e)));
  }

  deleteEstate(id: string) {
    this.commitEstates(this.readEstates().filter((e) => e.id !== id));
  }

  addVisitSlot(estateId: string, slot: Omit<VisitSlot, 'id' | 'isBooked'>) {
    const next = this.readEstates().map((e) =>
      e.id === estateId
        ? { ...e, visitSlots: [...e.visitSlots, { ...slot, id: `${estateId}-slot-${Date.now()}`, isBooked: false }] }
        : e
    );
    this.commitEstates(next);
  }

  removeVisitSlot(estateId: string, slotId: string) {
    this.commitEstates(
      this.readEstates().map((e) =>
        e.id === estateId ? { ...e, visitSlots: e.visitSlots.filter((s) => s.id !== slotId) } : e
      )
    );
  }

  bookVisitSlot(estateId: string, slotId: string, userId: string, userName: string): boolean {
    const latest = this.readEstates();
    const estate = latest.find((e) => e.id === estateId);
    const slot = estate?.visitSlots.find((s) => s.id === slotId);
    if (!estate || !slot || slot.isBooked) return false;

    const bookedAt = new Date().toISOString();
    this.commitEstates(
      latest.map((e) =>
        e.id === estateId
          ? {
              ...e,
              visitSlots: e.visitSlots.map((s) =>
                s.id === slotId
                  ? { ...s, isBooked: true, bookedByUserId: userId, bookedByName: userName, bookedAt, bookingStatus: 'pending' }
                  : s
              ),
            }
          : e
      )
    );
    return true;
  }

  approveBooking(estateId: string, slotId: string) {
    this.commitEstates(
      this.readEstates().map((e) =>
        e.id === estateId
          ? { ...e, visitSlots: e.visitSlots.map((s) => (s.id === slotId ? { ...s, bookingStatus: 'approved' } : s)) }
          : e
      )
    );
  }

  deleteBooking(estateId: string, slotId: string) {
    this.removeVisitSlot(estateId, slotId);
  }
}
