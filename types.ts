export enum VehicleType {
  BUS = 'Xe Khách',
  COACH = 'Bus Giường Nằm',
  PLANE = 'Máy Bay'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PARTNER = 'PARTNER'
}

export type AppView = 'home' | 'booking' | 'payment' | 'success' | 'history' | 'admin' | 'promotions' | 'partner';
export type SearchMode = 'transport' | 'hotel';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status?: 'ACTIVE' | 'BANNED';
  banUntil?: string | null;
  phone?: string;
}

export interface TripStop {
  id: string;
  time: string;
  location: string;
  description: string;
  type: 'PICKUP' | 'DROP' | 'REST' | 'MEAL' | 'STATION';
}

export interface TransportDetails {
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  driverId: string;
  vehicleDoc: string;
}

export interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  vehicleId: string;
  vehicleType: VehicleType;
  duration: string;
  availableSeats: number;
  totalSeats: number;
  stops: TripStop[]; 
  amenities: string[]; 
  partnerId?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CANCELLED';
  transportDetails?: TransportDetails;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  pricePerNight: number;
  rating: number;
  image: string;
  amenities: string[];
  availableRooms: number;
  distance: number;
}

export interface Voucher {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  expiryDate: string;
}

export interface Ticket {
  id: string;
  tripId?: string; 
  hotelId?: string; 
  userId: string;
  voucherId?: string;
  seatNumber?: string; 
  roomType?: string; 
  bookingDate: string;
  status: 'BOOKED' | 'PAID' | 'CANCELLED';
  cancelReason?: string;
  tripDetails?: Trip; 
  hotelDetails?: Hotel; 
  userDetails?: User;
  totalPrice?: number;
}