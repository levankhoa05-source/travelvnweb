import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bus, 
  Plane, 
  Calendar, 
  MapPin, 
  Search, 
  User as UserIcon, 
  History, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  CheckCircle,
  LayoutDashboard,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  Lock,
  Loader2,
  Tag,
  Star,
  ArrowRight,
  Building2,
  Bed,
  Wifi,
  Coffee,
  Utensils,
  Info,
  Copy,
  TicketPercent,
  Home,
  Briefcase
} from 'lucide-react';
import { Trip, User, UserRole, VehicleType, Ticket, Hotel, TripStop, AppView, SearchMode } from './types';
import { generatePartners, generateTrips, generateHotels, generateTripStops, CITIES } from './lib/mockData';

import { Navbar, Footer, Toast, ToastType } from './components/Layout';
import { AdminDashboard, PartnerDashboard } from './components/Dashboards';
import { AuthModal, TripDetailsModal, SeatSelector } from './components/Modals';
import { HomeView, PaymentView, SuccessView, HistoryView, PromotionsPage } from './components/CoreViews';

// --- MAIN APP ---

function App() {
  const [view, setView] = useState<AppView>('home');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('travelvn_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  
  useEffect(() => {
    if (user) {
      localStorage.setItem('travelvn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('travelvn_user');
    }
  }, [user]);

  // Data State
  const [allTrips, setAllTrips] = useState<Trip[]>(generateTrips());
  const [partners, setPartners] = useState<User[]>(generatePartners()); // Manage Partners State
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  
  // ĐÃ SỬA LỖI Ở DÒNG NÀY: Thêm setAllHotels vào useState
  const [allHotels, setAllHotels] = useState<Hotel[]>(generateHotels());
  
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [suggestedHotels, setSuggestedHotels] = useState<Hotel[]>([]); // Hotels suggested after trip search

  const [searchMode, setSearchMode] = useState<SearchMode>('transport');
  const [currentSearchType, setCurrentSearchType] = useState('all'); 
  const [isSearching, setIsSearching] = useState(false); 
  
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  
  // New State for viewing details
  const [viewingTripDetails, setViewingTripDetails] = useState<Trip | null>(null);

  const [bookingSeats, setBookingSeats] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cancellingTicketId, setCancellingTicketId] = useState<string | null>(null);
  const [savedPromos, setSavedPromos] = useState<string[]>([]);

  // Hotel filtering and sorting state
  const [hotelSortBy, setHotelSortBy] = useState<'price_asc' | 'price_desc' | 'rating_desc' | 'distance_asc'>('price_asc');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const displayedHotels = useMemo(() => {
    let result = [...filteredHotels];
    if (selectedAmenities.length > 0) {
      result = result.filter(hotel => 
        selectedAmenities.every(amenity => hotel.amenities.includes(amenity))
      );
    }
    result.sort((a, b) => {
      if (hotelSortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
      if (hotelSortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
      if (hotelSortBy === 'rating_desc') return b.rating - a.rating;
      if (hotelSortBy === 'distance_asc') return a.distance - b.distance;
      return 0;
    });
    return result;
  }, [filteredHotels, selectedAmenities, hotelSortBy]);

  // Notification State
  const [notification, setNotification] = useState<{ message: string, type: ToastType } | null>(null);

  const showNotification = (message: string, type: ToastType = 'info') => {
    setNotification({ message, type });
  };

  const handleCopyCode = (code: string) => {
    if (savedPromos.includes(code)) {
      showNotification(`Mã ${code} đã được lưu trước đó!`, 'info');
      return;
    }
    navigator.clipboard.writeText(code);
    setSavedPromos([...savedPromos, code]);
    showNotification(`Đã lưu mã giảm giá: ${code}`, 'success');
  };

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, hotelsRes, ticketsRes] = await Promise.all([
          fetch('/api/trips'),
          fetch('/api/hotels'),
          fetch('/api/tickets')
        ]);
        
        if (tripsRes.ok) {
          const trips = await tripsRes.json();
          setAllTrips(trips);
        }
        if (hotelsRes.ok) {
          const hotels = await hotelsRes.json();
          setAllHotels(hotels);
        }
        if (ticketsRes.ok) {
          const tickets = await ticketsRes.json();
          setTickets(tickets);
        }
      } catch (error) {
        console.error('Failed to fetch data from API, using mock data', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Only show Approved trips to users
    setFilteredTrips(allTrips.filter(t => t.status === 'APPROVED'));
    setFilteredHotels(allHotels);
  }, [allTrips, allHotels]);

  // Handle Add Trip for Partners
  const handleAddTrip = (tripData: any) => {
    if (!user || user.status === 'BANNED') {
      showNotification('Tài khoản của bạn đã bị khóa hoặc không có quyền thực hiện.', 'error');
      return;
    }
    
    const newTrip: Trip = {
      id: `trip-partner-${Date.now()}`,
      ...tripData,
      vehicleId: `v-partner-${Date.now()}`,
      availableSeats: tripData.totalSeats,
      stops: generateTripStops(tripData.from, tripData.to, tripData.time, tripData.duration, tripData.vehicleType),
      amenities: ['Wifi', 'Nước uống', 'Cổng sạc', 'Bảo hiểm'],
      status: 'PENDING',
      partnerId: user.id
    };
    
    setAllTrips(prev => [newTrip, ...prev]);
    showNotification('Đã gửi yêu cầu tạo chuyến! Vui lòng chờ Admin duyệt.', 'success');
  };
  
  const handleDeleteTrip = (tripId: string) => {
    setAllTrips(prev => prev.filter(t => t.id !== tripId));
    showNotification('Đã xóa chuyến đi thành công.', 'success');
  };

  const handleApproveTrip = (tripId: string) => {
    setAllTrips(prev => prev.map(t => 
      t.id === tripId ? { ...t, status: 'APPROVED' } : t
    ));
    showNotification('Đã phê duyệt chuyến đi thành công.', 'success');
  };

  const handleRejectTrip = (tripId: string) => {
    setAllTrips(prev => prev.filter(t => t.id !== tripId));
    showNotification('Đã từ chối chuyến đi.', 'info');
  };

  const handleBanPartner = (partnerId: string, durationDays: number | null) => {
    setPartners(prev => prev.map(p => {
       if (p.id === partnerId) {
          const banUntil = durationDays ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : null;
          return { ...p, status: 'BANNED', banUntil };
       }
       return p;
    }));
    showNotification('Đã khóa tài khoản đối tác thành công.', 'success');
  };

  const handleUnbanPartner = (partnerId: string) => {
    setPartners(prev => prev.map(p => 
      p.id === partnerId ? { ...p, status: 'ACTIVE', banUntil: null } : p
    ));
    showNotification('Đã mở khóa tài khoản đối tác.', 'success');
  };

  const handleSearch = (mode: SearchMode, criteria: any) => {
    setIsSearching(true);
    setSearchMode(mode);

    if (mode === 'transport') {
      const { from, to, date, type, timeRange } = criteria;
      setCurrentSearchType(type); 
      // Filter only approved trips
      let results = allTrips.filter(t => t.status === 'APPROVED');
      
      if (from) results = results.filter(t => t.from === from);
      if (to) results = results.filter(t => t.to === to);
      if (date) results = results.filter(t => t.date === date);
      
      if (type && type !== 'all') {
        results = results.filter(t => t.vehicleType === type);
      }

      if (timeRange && timeRange !== 'all') {
        const [startStr, endStr] = timeRange.split('-');
        const start = parseInt(startStr.replace(':', ''));
        const end = parseInt(endStr.replace(':', ''));
        
        results = results.filter(t => {
          const tripTime = parseInt(t.time.replace(':', ''));
          return tripTime >= start && tripTime <= end;
        });
      }

      setFilteredTrips(results);

      // Filter hotels for suggestion based on 'to'
      if (to) {
        const suggestion = allHotels.filter(h => h.city === to);
        setSuggestedHotels(suggestion.slice(0, 3)); // Suggest up to 3 hotels
      } else {
        setSuggestedHotels([]);
      }

    } else {
      // Hotel Search
      const { city } = criteria;
      let results = allHotels;
      if (city) results = results.filter(h => h.city === city);
      setFilteredHotels(results);
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    setIsSearching(false);
  };

  const handleStartBooking = (trip: Trip) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    
    // Check if user is admin or partner
    if (user.role === UserRole.ADMIN || user.role === UserRole.PARTNER) {
      showNotification(`${user.role === UserRole.ADMIN ? 'Quản trị viên' : 'Đối tác'} không thể thực hiện đặt vé. Vui lòng sử dụng tài khoản Khách hàng.`, 'error');
      return;
    }

    setSelectedTrip(trip);
    setSelectedHotel(null);
    setView('booking');
  };

  const handleViewDetails = (trip: Trip) => {
    setViewingTripDetails(trip);
  };

  const handleStartHotelBooking = (hotel: Hotel) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Check if user is admin or partner
    if (user.role === UserRole.ADMIN || user.role === UserRole.PARTNER) {
      showNotification(`${user.role === UserRole.ADMIN ? 'Quản trị viên' : 'Đối tác'} không thể thực hiện đặt phòng. Vui lòng sử dụng tài khoản Khách hàng.`, 'error');
      return;
    }

    setSelectedHotel(hotel);
    setSelectedTrip(null);
    // Directly go to payment for simplified hotel flow
    // In real app, we'd have date selection etc again.
    setBookingSeats(['Standard Room']); // Mock booking item
    setView('payment');
  };

  const handleConfirmSeats = (seats: string[]) => {
    setBookingSeats(seats);
    setView('payment');
  };

  const handlePaymentSuccess = async (finalPrice: number) => {
    if (selectedTrip && user) {
      const pricePerTicket = finalPrice / bookingSeats.length;
      const newTickets: Ticket[] = bookingSeats.map(seat => ({
        id: Math.random().toString(36).substr(2, 9),
        tripId: selectedTrip.id,
        userId: user.id,
        seatNumber: seat,
        bookingDate: new Date().toISOString(),
        status: 'BOOKED',
        tripDetails: selectedTrip,
        userDetails: user,
        totalPrice: pricePerTicket
      }));

      // Try to save to DB
      try {
        await Promise.all(newTickets.map(ticket => 
          fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
          })
        ));
      } catch (e) {
        console.error('Failed to save ticket to DB', e);
      }

      setTickets([...tickets, ...newTickets]);
      setAllTrips(prev => prev.map(t => t.id === selectedTrip.id ? { ...t, availableSeats: t.availableSeats - bookingSeats.length } : t));
      showNotification('Đặt vé thành công! Vé đã được gửi đến email của bạn.', 'success');
      setView('success');
    } else if (selectedHotel && user) {
      const newTicket: Ticket = {
        id: Math.random().toString(36).substr(2, 9),
        hotelId: selectedHotel.id,
        userId: user.id,
        roomType: 'Standard Room',
        bookingDate: new Date().toISOString(),
        status: 'BOOKED',
        hotelDetails: selectedHotel,
        userDetails: user,
        totalPrice: finalPrice
      };

      try {
        await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTicket)
        });
      } catch (e) {
        console.error('Failed to save ticket to DB', e);
      }

      setTickets([...tickets, newTicket]);
      showNotification('Đặt phòng thành công! Chúc bạn kỳ nghỉ vui vẻ.', 'success');
      setView('success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onLoginClick={() => setAuthModalOpen(true)}
        currentView={view}
        setView={setView}
      />

      {/* Main Content Router */}
      <main className="flex-grow">
        {view === 'home' && (
          <HomeView
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            filteredTrips={filteredTrips}
            currentSearchType={currentSearchType}
            handleStartBooking={handleStartBooking}
            handleViewDetails={handleViewDetails}
            suggestedHotels={suggestedHotels}
            allHotels={allHotels}
            setFilteredHotels={setFilteredHotels}
            handleStartHotelBooking={handleStartHotelBooking}
            hotelSortBy={hotelSortBy}
            setHotelSortBy={setHotelSortBy}
            selectedAmenities={selectedAmenities}
            setSelectedAmenities={setSelectedAmenities}
            displayedHotels={displayedHotels}
            handleCopyCode={handleCopyCode}
            handleSearch={handleSearch}
            savedPromos={savedPromos}
          />
        )}

        {view === 'booking' && selectedTrip && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <button onClick={() => setView('home')} className="mb-4 text-blue-600 font-medium hover:underline flex items-center gap-1">
              <ArrowRight className="h-4 w-4 rotate-180" /> Quay lại tìm kiếm
            </button>
            <SeatSelector trip={selectedTrip} onConfirm={handleConfirmSeats} />
          </div>
        )}

        {view === 'payment' && (selectedTrip || selectedHotel) && (
          <PaymentView
            selectedTrip={selectedTrip}
            selectedHotel={selectedHotel}
            bookingSeats={bookingSeats}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => setView('home')}
          />
        )}

        {view === 'success' && (
          <SuccessView isHotel={!!selectedHotel} setView={setView} />
        )}

        {view === 'history' && user && (
          <HistoryView
            user={user}
            tickets={tickets}
            setView={setView}
            setCancellingTicketId={setCancellingTicketId}
          />
        )}

        {view === 'admin' && user?.role === UserRole.ADMIN && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <AdminDashboard 
              tickets={tickets} 
              trips={allTrips} 
              partners={partners}
              onApproveTrip={handleApproveTrip}
              onRejectTrip={handleRejectTrip}
              onBanPartner={handleBanPartner}
              onUnbanPartner={handleUnbanPartner}
            />
          </div>
        )}

        {view === 'partner' && user?.role === UserRole.PARTNER && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <PartnerDashboard 
              partner={user}
              trips={allTrips}
              tickets={tickets}
              onAddTrip={handleAddTrip}
              onDeleteTrip={handleDeleteTrip}
            />
          </div>
        )}

        {view === 'promotions' && (
          <PromotionsPage onCopy={handleCopyCode} savedPromos={savedPromos} />
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      {cancellingTicketId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận hủy vé</h3>
            <p className="text-slate-600 mb-6">Bạn có chắc chắn muốn hủy giao dịch này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setCancellingTicketId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition"
              >
                Đóng
              </button>
              <button 
                onClick={async () => {
                  const ticketToCancel = tickets.find(t => t.id === cancellingTicketId);
                  
                  // MẸO: Nếu muốn kết nối Database để hủy vé thì bạn bỏ comment đoạn fetch dưới đây
                  /*
                  try {
                    await fetch(`/api/tickets/${cancellingTicketId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'CANCELLED' })
                    });
                  } catch (e) {
                    console.error('Lỗi khi hủy vé:', e);
                  }
                  */

                  if (ticketToCancel && ticketToCancel.tripId) {
                    setAllTrips(prev => prev.map(t => t.id === ticketToCancel.tripId ? { ...t, availableSeats: t.availableSeats + 1 } : t));
                  }
                  setTickets(prev => prev.map(t => t.id === cancellingTicketId ? { ...t, status: 'CANCELLED' } : t));
                  setCancellingTicketId(null);
                  showNotification('Đã hủy thành công.', 'success');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Đồng ý hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} />
      )}

      {/* Trip Details Modal */}
      {viewingTripDetails && (
        <TripDetailsModal 
          trip={viewingTripDetails} 
          onClose={() => setViewingTripDetails(null)} 
          onBook={(t) => {
            handleStartBooking(t);
            // Modal closes via onClose in the component, but we ensure state flow here
          }}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
}

export default App;