export type Role = 'user' | 'worker' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: Role;
  adminId?: string;
  active?: boolean;
}

export interface StoredUser extends User {
  password: string;
}

export type ListingPurpose = 'rent' | 'sale';
export type ListingStatus = 'active' | 'rented' | 'sold';

export interface VisitSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedByUserId?: string;
  bookedByName?: string;
  bookedAt?: string;
  bookingStatus?: 'pending' | 'approved';
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
  type: 'apartment' | 'house' | 'studio' | 'villa';
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
  bookingStatus: 'pending' | 'approved';
}

export interface AppNotification {
  id: string;
  userId: string;
  estateId: string;
  estateTitle: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export type AuditAction =
  | 'worker_created'
  | 'worker_activated'
  | 'worker_deactivated'
  | 'login_blocked_inactive'
  | 'estate_created'
  | 'estate_deleted'
  | 'estate_status_changed';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: AuditAction;
  targetId?: string;
  targetName?: string;
  details?: string;
}
