import React from 'react';
import { MapPin, Star, Clock, Users, Wifi, Coffee, Utensils, CheckCircle, ArrowRight, Building2, Bed, Plane, Bus, Info } from 'lucide-react';
import { Trip, Hotel, VehicleType, User, UserRole } from '../types';

export const TripCard: React.FC<{ trip: Trip, onBook: (t: Trip) => void, onViewDetails: (t: Trip) => void, user?: User | null }> = ({ trip, onBook, onViewDetails, user }) => {
  const isPlane = trip.vehicleType === VehicleType.PLANE;
  const canBook = !user || (user.role !== UserRole.ADMIN && user.role !== UserRole.PARTNER);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition duration-200">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        
        <div className="flex gap-4 items-center">
          <div className={`p-3 rounded-xl ${isPlane ? 'bg-sky-100 text-sky-600' : 'bg-orange-100 text-orange-600'}`}>
            {isPlane ? <Plane className="h-6 w-6" /> : <Bus className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg text-slate-800">{trip.time}</span>
              <div className="h-[2px] w-8 bg-slate-200"></div>
              <span className="text-sm text-slate-500">{trip.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <span className="font-medium">{trip.from}</span>
              <span className="text-slate-400">→</span>
              <span className="font-medium">{trip.to}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{trip.vehicleType} • {trip.date}</p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
          <div className="text-right">
            <span className="block text-xs text-slate-500">Giá vé từ</span>
            <span className="block text-xl font-bold text-blue-600">{trip.price.toLocaleString()} đ</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => onViewDetails(trip)}
              className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-2 rounded-lg text-sm font-semibold transition"
              title="Xem chi tiết"
            >
              <Info className="h-4 w-4" />
            </button>
            {canBook && (
              <button 
                onClick={() => onBook(trip)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Chọn chuyến
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HotelCard: React.FC<{ hotel: Hotel, onBook: (h: Hotel) => void, user?: User | null }> = ({ hotel, onBook, user }) => {
  const isSoldOut = hotel.availableRooms === 0;
  const canBook = !user || (user.role !== UserRole.ADMIN && user.role !== UserRole.PARTNER);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition duration-200 flex flex-col md:flex-row h-full">
      <div className="w-full md:w-1/3 h-48 md:h-auto relative">
        <img src={hotel.image} alt={hotel.name} className={`w-full h-full object-cover ${isSoldOut ? 'grayscale' : ''}`} />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {hotel.rating.toFixed(1)}
        </div>
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
             <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-sm transform -rotate-12 border-2 border-white">HẾT PHÒNG</span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">{hotel.name}</h3>
          <div className="flex items-start gap-1 text-slate-500 text-sm mb-1">
             <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
             <span>{hotel.address}</span>
          </div>
          <div className="text-xs text-slate-400 mb-3">
            Cách trung tâm {hotel.distance} km
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {hotel.amenities.slice(0, 4).map((am, i) => (
              <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                {am}
              </span>
            ))}
            {hotel.amenities.length > 4 && <span className="text-xs text-slate-400 pt-1">+{hotel.amenities.length - 4}</span>}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-2">
           <div className={`text-xs font-bold ${isSoldOut ? 'text-red-500' : 'text-green-600'}`}>
             {isSoldOut ? 'Hết phòng' : `Còn ${hotel.availableRooms} phòng`}
           </div>
           <div className="text-right">
             <div className="text-lg font-bold text-blue-600">{hotel.pricePerNight.toLocaleString()} đ</div>
             <div className="text-xs text-slate-400">/ đêm</div>
           </div>
           {canBook && (
             <button 
               disabled={isSoldOut}
               onClick={() => onBook(hotel)}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition
                  ${isSoldOut 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
             >
               {isSoldOut ? 'Hết phòng' : 'Đặt phòng'}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
