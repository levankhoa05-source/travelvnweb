import React from 'react';
import { Bus, Plane, Building2, CheckCircle, Tag, Phone, CreditCard, History, Calendar, ArrowRight, MapPin, Building, Home, TicketPercent, Copy } from 'lucide-react';
import { Trip, Hotel, VehicleType, SearchMode, AppView, User, Ticket } from '../types';
import { SearchHero, PromotionSection, PopularDestinations } from './HomeWidgets';
import { TripCard, HotelCard } from './Cards';
import { SeatSelector } from './Modals';

interface HomeViewProps {
  isSearching: boolean;
  setIsSearching: (val: boolean) => void;
  searchMode: SearchMode;
  setSearchMode: (val: SearchMode) => void;
  filteredTrips: Trip[];
  currentSearchType: string;
  handleStartBooking: (trip: Trip) => void;
  handleViewDetails: (trip: Trip) => void;
  suggestedHotels: Hotel[];
  allHotels: Hotel[];
  setFilteredHotels: (hotels: Hotel[]) => void;
  handleStartHotelBooking: (hotel: Hotel) => void;
  hotelSortBy: string;
  setHotelSortBy: (val: any) => void;
  selectedAmenities: string[];
  setSelectedAmenities: React.Dispatch<React.SetStateAction<string[]>>;
  displayedHotels: Hotel[];
  handleCopyCode: (code: string) => void;
  handleSearch: (mode: SearchMode, criteria: any) => void;
  savedPromos: string[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  isSearching,
  setIsSearching,
  searchMode,
  setSearchMode,
  filteredTrips,
  currentSearchType,
  handleStartBooking,
  handleViewDetails,
  suggestedHotels,
  allHotels,
  setFilteredHotels,
  handleStartHotelBooking,
  hotelSortBy,
  setHotelSortBy,
  selectedAmenities,
  setSelectedAmenities,
  displayedHotels,
  handleCopyCode,
  handleSearch,
  savedPromos
}) => {
  return (
    <>
      <SearchHero onSearch={handleSearch} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isSearching ? (
           /* SEARCH RESULTS VIEW */
           <>
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-slate-800">
                 {searchMode === 'transport' ? 'Kết quả tìm kiếm chuyến đi' : 'Khách sạn phù hợp'}
               </h2>
               <button onClick={() => setIsSearching(false)} className="text-blue-600 hover:underline">Xóa bộ lọc</button>
             </div>
             
             {/* TRANSPORT RESULTS */}
             {searchMode === 'transport' && (
               <>
                 {filteredTrips.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                      <p className="text-slate-500 mb-2">Không tìm thấy chuyến đi nào phù hợp.</p>
                      <button onClick={() => setIsSearching(false)} className="text-blue-600 font-medium">Thử tìm kiếm lại</button>
                    </div>
                 ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                       {/* Group Logic or List Logic */}
                       {currentSearchType !== 'all' ? (
                         <div className="grid gap-4">
                           {filteredTrips.map(trip => (
                             <TripCard 
                               key={trip.id} 
                               trip={trip} 
                               onBook={handleStartBooking}
                               onViewDetails={handleViewDetails}
                             />
                           ))}
                         </div>
                       ) : (
                         <>
                           {filteredTrips.some(t => t.vehicleType === VehicleType.PLANE) && (
                             <div>
                                <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                                  <div className="p-2 bg-sky-100 rounded-lg text-sky-600"><Plane size={20}/></div>
                                  Máy Bay
                                </h3>
                                <div className="grid gap-4">
                                   {filteredTrips.filter(t => t.vehicleType === VehicleType.PLANE).map(trip => (
                                     <TripCard 
                                        key={trip.id} 
                                        trip={trip} 
                                        onBook={handleStartBooking}
                                        onViewDetails={handleViewDetails}
                                      />
                                   ))}
                                </div>
                             </div>
                           )}

                           {filteredTrips.some(t => t.vehicleType !== VehicleType.PLANE) && (
                             <div className={filteredTrips.some(t => t.vehicleType === VehicleType.PLANE) ? "mt-8" : ""}>
                                <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Bus size={20}/></div>
                                  Xe Khách & Bus
                                </h3>
                                <div className="grid gap-4">
                                   {filteredTrips.filter(t => t.vehicleType !== VehicleType.PLANE).map(trip => (
                                     <TripCard 
                                      key={trip.id} 
                                      trip={trip} 
                                      onBook={handleStartBooking}
                                      onViewDetails={handleViewDetails}
                                     />
                                   ))}
                                </div>
                             </div>
                           )}
                         </>
                       )}
                    </div>
                 )}

                 {/* HOTEL SUGGESTIONS BELOW TRIP RESULTS */}
                 {suggestedHotels.length > 0 && (
                   <div className="mt-12 pt-8 border-t border-slate-200">
                     <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                       <Building2 className="h-6 w-6 text-purple-600" />
                       Gợi ý khách sạn tại điểm đến
                     </h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {suggestedHotels.map(hotel => (
                         <div key={hotel.id} className="h-full">
                            <HotelCard hotel={hotel} onBook={handleStartHotelBooking} />
                         </div>
                       ))}
                     </div>
                     <div className="mt-6 text-center">
                       <button 
                         onClick={() => {
                           setSearchMode('hotel');
                           // Optionally filter strictly by destination
                           setFilteredHotels(allHotels.filter(h => h.city === suggestedHotels[0].city));
                           window.scrollTo({ top: 0, behavior: 'smooth' });
                         }}
                         className="text-blue-600 font-bold hover:underline"
                       >
                         Xem thêm khách sạn tại {suggestedHotels[0].city} →
                       </button>
                     </div>
                   </div>
                 )}
               </>
             )}

             {/* HOTEL RESULTS */}
             {searchMode === 'hotel' && (
               <div className="flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4">
                 {/* Sidebar Filters */}
                 <div className="w-full md:w-1/4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm h-fit">
                   <h3 className="font-bold text-slate-800 mb-4">Sắp xếp theo</h3>
                   <div className="space-y-2 mb-6">
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="sort" checked={hotelSortBy === 'price_asc'} onChange={() => setHotelSortBy('price_asc')} className="text-blue-600 focus:ring-blue-500" />
                       <span className="text-sm text-slate-600">Giá tăng dần</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="sort" checked={hotelSortBy === 'price_desc'} onChange={() => setHotelSortBy('price_desc')} className="text-blue-600 focus:ring-blue-500" />
                       <span className="text-sm text-slate-600">Giá giảm dần</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="sort" checked={hotelSortBy === 'rating_desc'} onChange={() => setHotelSortBy('rating_desc')} className="text-blue-600 focus:ring-blue-500" />
                       <span className="text-sm text-slate-600">Đánh giá cao nhất</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" name="sort" checked={hotelSortBy === 'distance_asc'} onChange={() => setHotelSortBy('distance_asc')} className="text-blue-600 focus:ring-blue-500" />
                       <span className="text-sm text-slate-600">Gần trung tâm nhất</span>
                     </label>
                   </div>

                   <h3 className="font-bold text-slate-800 mb-4">Tiện ích</h3>
                   <div className="space-y-2">
                     {['Wifi', 'Pool', 'Breakfast', 'Gym', 'Spa', 'Bar'].map(amenity => (
                       <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={selectedAmenities.includes(amenity)}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setSelectedAmenities(prev => [...prev, amenity]);
                             } else {
                               setSelectedAmenities(prev => prev.filter(a => a !== amenity));
                             }
                           }}
                           className="rounded text-blue-600 focus:ring-blue-500" 
                         />
                         <span className="text-sm text-slate-600">{amenity}</span>
                       </label>
                     ))}
                   </div>
                 </div>

                 {/* Results */}
                 <div className="w-full md:w-3/4">
                   <div className="grid grid-cols-1 gap-6">
                     {displayedHotels.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                          <p className="text-slate-500 mb-2">Không tìm thấy khách sạn nào phù hợp với bộ lọc.</p>
                          <button onClick={() => { setSelectedAmenities([]); setHotelSortBy('price_asc'); }} className="text-blue-600 font-medium hover:underline">Xóa bộ lọc</button>
                        </div>
                     ) : (
                        displayedHotels.map(hotel => (
                          <HotelCard key={hotel.id} hotel={hotel} onBook={handleStartHotelBooking} />
                        ))
                     )}
                   </div>
                 </div>
               </div>
             )}
           </>
        ) : (
          /* LANDING PAGE CONTENT */
          <div className="animate-in fade-in duration-500">
            <PromotionSection onCopy={handleCopyCode} savedPromos={savedPromos} />
            <PopularDestinations onExplore={(city) => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              handleSearch('transport', { to: city, from: '', date: '', type: 'all', timeRange: 'all' });
            }} />
            
            {/* Why Choose Us */}
            <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-slate-200 mt-12">
               <div className="p-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                     <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Đặt vé nhanh chóng</h3>
                  <p className="text-slate-500">Thao tác đơn giản, xác nhận vé ngay lập tức qua email.</p>
               </div>
               <div className="p-6">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                     <Tag className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Giá tốt nhất</h3>
                  <p className="text-slate-500">Luôn có ưu đãi độc quyền và giá cạnh tranh nhất thị trường.</p>
               </div>
               <div className="p-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                     <Phone className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Hỗ trợ 24/7</h3>
                  <p className="text-slate-500">Đội ngũ hỗ trợ chuyên nghiệp, sẵn sàng giải đáp mọi thắc mắc.</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

interface PaymentViewProps {
  selectedTrip: Trip | null;
  selectedHotel: Hotel | null;
  bookingSeats: string[];
  onPaymentSuccess: (finalPrice: number) => void;
  onCancel: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({
  selectedTrip,
  selectedHotel,
  bookingSeats,
  onPaymentSuccess,
  onCancel
}) => {
  const [promoCode, setPromoCode] = React.useState('');
  const [discount, setDiscount] = React.useState(0);
  const [promoError, setPromoError] = React.useState('');

  const handleApplyPromo = () => {
  if (promoCode === 'FLY20' && selectedTrip && selectedTrip.vehicleType === VehicleType.PLANE) {
  setDiscount(0.2);
  setPromoError('');
} else if (
  promoCode === 'BUS50' && 
  selectedTrip && 
  (selectedTrip.vehicleType === VehicleType.BUS || selectedTrip.vehicleType === VehicleType.COACH)
) {
  setDiscount(50000);
  setPromoError('');
} else if (promoCode === 'HOTEL2024' && selectedHotel) {
      setDiscount(0.15);
      setPromoError('');
    } else if (promoCode === 'NEWBIE100') {
      setDiscount(100000);
      setPromoError('');
    } else if (promoCode === 'WEEKEND') {
      setDiscount(0.1);
      setPromoError('');
    } else if (promoCode === 'VIPPRO') {
      setDiscount(0.05);
      setPromoError('');
    } else {
      setDiscount(0);
      setPromoError('Mã ưu đãi không hợp lệ hoặc không áp dụng cho dịch vụ này.');
    }
  };

  const basePrice = selectedTrip ? selectedTrip.price * bookingSeats.length : (selectedHotel ? selectedHotel.pricePerNight : 0);
  const discountAmount = discount < 1 ? basePrice * discount : discount;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-50 rounded-full">
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Thanh toán</h2>
        <p className="text-center text-slate-500 mb-8">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
        
        <div className="space-y-4 mb-6 bg-slate-50 p-6 rounded-xl">
          {selectedTrip ? (
            <>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Chuyến đi</span>
              <span className="font-medium">{selectedTrip.from} - {selectedTrip.to}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Số lượng ghế</span>
              <span className="font-medium">{bookingSeats.length} ({bookingSeats.join(', ')})</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Tạm tính</span>
              <span className="font-medium">{basePrice.toLocaleString()} đ</span>
            </div>
            </>
          ) : selectedHotel ? (
            <>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Khách sạn</span>
              <span className="font-medium">{selectedHotel.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Loại phòng</span>
              <span className="font-medium">Tiêu chuẩn</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-500">Tạm tính</span>
              <span className="font-medium">{basePrice.toLocaleString()} đ</span>
            </div>
            </>
          ) : null}
          
          {discountAmount > 0 && (
            <div className="flex justify-between py-2 border-b border-slate-200 text-green-600">
              <span>Giảm giá</span>
              <span className="font-medium">- {discountAmount.toLocaleString()} đ</span>
            </div>
          )}
          
          <div className="flex justify-between py-2 pt-4">
            <span className="text-slate-800 font-bold">Tổng tiền</span>
            <span className="font-bold text-2xl text-blue-600">{finalPrice.toLocaleString()} đ</span>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">Mã ưu đãi</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã ưu đãi..." 
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            <button 
              onClick={handleApplyPromo}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition"
            >
              Áp dụng
            </button>
          </div>
          {promoError && <p className="text-red-500 text-sm mt-2">{promoError}</p>}
          {discountAmount > 0 && <p className="text-green-600 text-sm mt-2">Áp dụng mã ưu đãi thành công!</p>}
        </div>

        <button 
        onClick={() => onPaymentSuccess(finalPrice)}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition"
        >
          Xác nhận thanh toán (Mô phỏng)
        </button>
        <button 
        onClick={onCancel}
        className="w-full mt-3 text-slate-500 py-2 font-medium hover:text-slate-800"
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  );
};

interface SuccessViewProps {
  isHotel: boolean;
  setView: (view: AppView) => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ isHotel, setView }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <div className="inline-flex p-4 bg-green-100 rounded-full mb-6 ring-8 ring-green-50 animate-in zoom-in">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Đặt {isHotel ? 'phòng' : 'vé'} thành công!</h2>
      <p className="text-slate-600 mb-8">Cảm ơn bạn đã sử dụng dịch vụ. Thông tin đã được gửi tới email của bạn.</p>
      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setView('history')}
          className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition"
        >
          Xem lịch sử đặt
        </button>
        <button 
          onClick={() => setView('home')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
};

interface HistoryViewProps {
  user: User;
  tickets: Ticket[];
  setView: (view: AppView) => void;
  setCancellingTicketId: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ user, tickets, setView, setCancellingTicketId }) => {
  const userTickets = tickets.filter(t => t.userId === user.id).sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <History className="h-8 w-8 text-blue-600" /> Lịch sử giao dịch
        </h2>
      </div>
      
      <div className="space-y-6 mb-8">
        {userTickets.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <History className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có giao dịch nào</h3>
            <p className="text-slate-500">Bạn chưa thực hiện bất kỳ đặt vé hay phòng nào.</p>
            <button 
              onClick={() => setView('home')}
              className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Khám phá ngay
            </button>
          </div>
        ) : (
          userTickets.map(ticket => {
            const isCancellable = () => {
              if (ticket.status !== 'BOOKED') return false;
              return true; // Allow cancellation anytime for demo
            };

            return (
              <div key={ticket.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${ticket.status === 'BOOKED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                       {ticket.status === 'BOOKED' ? 'ĐẶT THÀNH CÔNG' : 'ĐÃ HỦY'}
                     </span>
                     <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Mã: #{ticket.id.toUpperCase()}</span>
                     <span className="text-sm text-slate-500 flex items-center gap-1">
                       <Calendar className="h-3.5 w-3.5" /> 
                       Đặt lúc: {new Date(ticket.bookingDate).toLocaleString('vi-VN')}
                     </span>
                  </div>
                  
                  {ticket.tripDetails ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          {ticket.tripDetails.vehicleType === VehicleType.PLANE ? <Plane className="h-5 w-5" /> : <Bus className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            {ticket.tripDetails.from} <ArrowRight className="h-4 w-4 text-slate-400" /> {ticket.tripDetails.to}
                          </h4>
                          <p className="text-sm font-medium text-blue-600">{ticket.tripDetails.vehicleType}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Ngày đi</p>
                          <p className="text-sm font-medium text-slate-800">{ticket.tripDetails.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Giờ đi</p>
                          <p className="text-sm font-medium text-slate-800">{ticket.tripDetails.time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Số ghế</p>
                          <p className="text-sm font-medium text-slate-800">{ticket.seatNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Thời gian</p>
                          <p className="text-sm font-medium text-slate-800">{ticket.tripDetails.duration}</p>
                        </div>
                      </div>
                    </div>
                  ) : ticket.hotelDetails ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-slate-800">
                            {ticket.hotelDetails.name}
                          </h4>
                          <p className="text-sm font-medium text-purple-600 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {ticket.hotelDetails.city}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Loại phòng</p>
                          <p className="text-sm font-medium text-slate-800">{ticket.roomType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1 uppercase font-semibold">Địa chỉ</p>
                          <p className="text-sm font-medium text-slate-800 truncate" title={ticket.hotelDetails.address}>{ticket.hotelDetails.address}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Tổng tiền</p>
                    <p className="font-bold text-2xl text-blue-600">
                      {(ticket.totalPrice !== undefined ? ticket.totalPrice : (ticket.tripDetails?.price || ticket.hotelDetails?.pricePerNight || 0)).toLocaleString()} đ
                    </p>
                  </div>
                  
                  {ticket.status === 'BOOKED' && (
                    isCancellable() ? (
                      <button 
                        onClick={() => setCancellingTicketId(ticket.id)}
                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition"
                      >
                        Hủy vé
                      </button>
                    ) : (
                      <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 text-center max-w-[150px]">
                        Không thể hủy (quá hạn 24h)
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {userTickets.length > 0 && (
        <div className="text-center border-t border-slate-200 pt-8">
           <button 
             onClick={() => setView('home')}
             className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition flex items-center gap-2 mx-auto shadow-sm"
           >
             <Home className="h-5 w-5" /> Quay về trang chủ
           </button>
        </div>
      )}

    </div>
  );
};

export const PromotionsPage: React.FC<{ onCopy: (code: string) => void, savedPromos: string[] }> = ({ onCopy, savedPromos }) => {
  const promotions = [
    { title: 'Giảm 20% vé máy bay', code: 'FLY20', color: 'bg-blue-500', desc: 'Áp dụng cho mọi chuyến bay nội địa.', validUntil: '30/04/2026' },
    { title: 'Giảm 50k vé xe khách', code: 'BUS50', color: 'bg-orange-500', desc: 'Áp dụng cho các tuyến xe khách đường dài.', validUntil: '15/05/2026' },
    { title: 'Combo Khách sạn Hè', code: 'HOTEL2024', color: 'bg-purple-500', desc: 'Giảm 15% khi đặt phòng từ 3 đêm trở lên.', validUntil: '31/08/2026' },
    { title: 'Chào bạn mới', code: 'NEWBIE100', color: 'bg-emerald-500', desc: 'Giảm 100k cho đơn hàng đầu tiên trên TravelVN.', validUntil: 'Không giới hạn' },
    { title: 'Flash Sale Cuối Tuần', code: 'WEEKEND', color: 'bg-rose-500', desc: 'Giảm thêm 10% khi đặt vé vào Thứ 7, Chủ Nhật.', validUntil: 'Mỗi cuối tuần' },
    { title: 'Ưu đãi thành viên VIP', code: 'VIPPRO', color: 'bg-amber-500', desc: 'Giảm 5% mọi dịch vụ cho hạng thẻ Vàng trở lên.', validUntil: '31/12/2026' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3">
          <TicketPercent className="h-10 w-10 text-red-500" />
          Kho Ưu Đãi Độc Quyền
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Khám phá hàng ngàn mã giảm giá và chương trình khuyến mãi hấp dẫn chỉ có tại TravelVN. Đặt vé ngay, tiết kiệm liền tay!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promotions.map((promo, i) => {
          const isSaved = savedPromos.includes(promo.code);
          return (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
             <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 ${promo.color} transition-transform duration-500 group-hover:scale-125`}></div>
             
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div className={`w-12 h-12 rounded-xl ${promo.color} bg-opacity-10 flex items-center justify-center text-${promo.color.replace('bg-', '')}`}>
                 <Tag className="h-6 w-6" />
               </div>
               <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                 HSD: {promo.validUntil}
               </span>
             </div>

             <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{promo.title}</h3>
             <p className="text-slate-500 mb-6 text-sm relative z-10 h-10">{promo.desc}</p>
             
             <div className="flex items-center justify-between pt-4 border-t border-slate-100 border-dashed relative z-10">
               <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 border-dashed">
                 <span className="font-mono font-bold text-slate-700 tracking-wider">{promo.code}</span>
               </div>
               <button 
                onClick={() => !isSaved && onCopy(promo.code)}
                disabled={isSaved}
                className={`${isSaved ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'} px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2`}
               >
                 {isSaved ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                 {isSaved ? 'Đã lưu' : 'Lưu mã'}
               </button>
             </div>
          </div>
        )})}
      </div>

      <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h2 className="text-3xl font-bold mb-4 relative z-10">Bạn chưa tìm thấy ưu đãi phù hợp?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto relative z-10">
          Đăng ký nhận bản tin để không bỏ lỡ bất kỳ chương trình khuyến mãi nào từ TravelVN. Chúng tôi sẽ gửi mã giảm giá trực tiếp vào email của bạn.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto relative z-10">
          <input 
            type="email" 
            placeholder="Nhập email của bạn..." 
            className="px-6 py-3 rounded-full text-slate-800 w-full focus:outline-none focus:ring-4 focus:ring-blue-400/50"
          />
          <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors whitespace-nowrap shadow-md">
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};
