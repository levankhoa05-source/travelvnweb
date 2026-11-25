import React, { useState, useMemo } from 'react';
import { X, User as UserIcon, Briefcase, Mail, Lock, Loader2, Facebook, MapPin, Clock, Bus, Plane, Bike, Calendar, Wifi, Coffee, Battery, Shield, FileText } from 'lucide-react';
import { User, UserRole, Trip, VehicleType } from '../types';
import { getRouteDistance } from '../lib/mockData';

export const AuthModal = ({ onClose, onLogin }: { onClose: () => void, onLogin: (user: User) => void }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'partner'>('user');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('travelvn_remember_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('travelvn_remember_email'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg('');
    if (!email.trim() || !password || (!isLoginMode && !name.trim())) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Địa chỉ email không đúng định dạng.');
      return;
    }
    if (!isLoginMode && password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('travelvn_remember_email', email.trim());
      } else {
        localStorage.removeItem('travelvn_remember_email');
      }

      if (!isLoginMode) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          role: activeTab === 'partner' ? UserRole.PARTNER : UserRole.USER,
          status: 'ACTIVE'
        };
        onLogin(newUser);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        setError('Email hoặc mật khẩu không đúng.');
        return;
      }

      const dbUser = await res.json();
      if (dbUser.status === 'BANNED') {
        setError('Tài khoản của bạn đã bị khóa.');
        return;
      }

      if (activeTab === 'partner' && dbUser.role !== UserRole.PARTNER) {
        setError('Tài khoản này không phải đối tác. Vui lòng đăng nhập ở tab Khách hàng.');
        return;
      }
      if (activeTab === 'user' && dbUser.role === UserRole.PARTNER) {
        setError('Tài khoản đối tác vui lòng đăng nhập bên tab Đối tác.');
        return;
      }

      onLogin(dbUser as User);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Không thể kết nối máy chủ đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const isUserTab = activeTab === 'user';
  const themeColor = isUserTab ? 'blue' : 'purple';
  const Icon = isUserTab ? UserIcon : Briefcase;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center mb-6">
          <div className={`bg-${themeColor}-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300`}>
             <Icon className={`h-6 w-6 text-${themeColor}-600 transition-colors duration-300`} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{isLoginMode ? 'Đăng nhập' : 'Đăng ký'}</h2>
          <p className="text-slate-500 text-sm mt-1">{isLoginMode ? 'Chào mừng bạn quay trở lại với TravelVN' : 'Tạo tài khoản mới để trải nghiệm TravelVN'}</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('user'); setError(''); setInfoMsg(''); }}
            className={`py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'user' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Khách hàng
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('partner'); setError(''); setInfoMsg(''); }}
            className={`py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'partner' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Đối tác / Nhà xe
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           {!isLoginMode && (
             <div>
               <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Họ và tên</label>
               <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition`}
                    placeholder="Nguyễn Văn A"
                  />
               </div>
             </div>
           )}
           <div>
             <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
             <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition`}
                  placeholder="name@example.com"
                />
             </div>
           </div>
           
           <div>
             <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mật khẩu</label>
             <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent transition`}
                  placeholder="••••••••"
                />
             </div>
           </div>

           {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
           {infoMsg && <p className="text-blue-700 text-sm text-center bg-blue-50 p-2 rounded-lg border border-blue-100">{infoMsg}</p>}

           {isLoginMode && (
             <div className="flex items-center justify-between text-sm">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={rememberMe}
                   onChange={(e) => setRememberMe(e.target.checked)}
                   className={`rounded border-slate-300 text-${themeColor}-600 focus:ring-${themeColor}-500`} 
                 />
                 <span className="text-slate-600">Ghi nhớ đăng nhập</span>
               </label>
               <button 
                 type="button"
                 onClick={() => setInfoMsg('Vui lòng liên hệ support@travelvn.com hoặc dùng tài khoản demo bên dưới để đặt lại mật khẩu.')}
                 className={`text-${themeColor}-600 hover:underline`}
               >
                 Quên mật khẩu?
               </button>
             </div>
           )}

           <button 
             type="submit"
             disabled={loading}
             className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-${themeColor}-200 flex items-center justify-center gap-2 disabled:opacity-70`}
           >
             {loading && <Loader2 className="h-4 w-4 animate-spin" />}
             {loading ? 'Đang xử lý...' : (isLoginMode ? `Đăng nhập ${isUserTab ? '' : 'Đối tác'}` : `Đăng ký ${isUserTab ? '' : 'Đối tác'}`)}
           </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-slate-500">{isLoginMode ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>{' '}
          <button 
            type="button"
            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setInfoMsg(''); }} 
            className={`text-${themeColor}-600 font-bold hover:underline`}
          >
            {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>

        <div className="mt-6 text-center">
           <p className="text-xs text-slate-400 mb-2">Hoặc tiếp tục với</p>
           <div className="flex justify-center gap-3">
             <button
               type="button"
               onClick={() => setInfoMsg('Đăng nhập nhanh qua Facebook hiện chưa hỗ trợ trong môi trường thử nghiệm.')}
               className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
             >
               <Facebook className={`h-5 w-5 text-${themeColor}-600`} />
             </button>
             <button
               type="button"
               onClick={() => setInfoMsg('Đăng nhập nhanh qua Google Email hiện chưa hỗ trợ trong môi trường thử nghiệm.')}
               className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
             >
               <Mail className="h-5 w-5 text-red-500" />
             </button>
           </div>
        </div>
        
        {isLoginMode && (
          <div className="text-center text-sm text-slate-500 mt-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
            {activeTab === 'user' ? (
               <>
                  <div>Admin DB: <strong>admin@travel.vn / 123456</strong></div>
                  <div className="mt-1 text-xs text-slate-400">Khách hàng: <strong>nguyenvana@gmail.com / 123456</strong> (hoặc chuyển sang Đăng ký).</div>
               </>
            ) : (
               <>
                  <div>Partner DB: <strong>phuongtrang@travel.vn / 123456</strong></div>
                  <div className="mt-1 text-xs text-slate-400">Đối tác đăng nhập bằng tài khoản DB hoặc chuyển sang Đăng ký.</div>
               </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface TripDetailsModalProps {
  trip: Trip;
  onClose: () => void;
  onBook: (trip: Trip) => void;
}

export const TripDetailsModal: React.FC<TripDetailsModalProps> = ({ trip, onClose, onBook }) => {
  const distance = trip.distance ?? getRouteDistance(trip.from, trip.to);
  const validAmenities = (trip.amenities || []).filter(Boolean);

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'nước uống':
      case 'ăn nhẹ': return <Coffee className="w-4 h-4" />;
      case 'cổng sạc': return <Battery className="w-4 h-4" />;
      case 'bảo hiểm': return <Shield className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Chi tiết chuyến đi</h2>
            <p className="text-sm text-slate-500 mt-1">
              {trip.partnerName || (trip.vehicleType === VehicleType.PLANE ? 'Hãng hàng không' : trip.vehicleType === VehicleType.MOTORBIKE ? 'Dịch vụ Xe Máy' : 'Nhà xe')} • {trip.date}
              {distance > 0 ? ` • ~${distance} km` : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* Route Overview */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{trip.time}</div>
              <div className="text-sm font-medium text-slate-600">{trip.from}</div>
            </div>
            <div className="flex-1 px-8 flex flex-col items-center">
              <div className="text-xs text-slate-500 mb-1">{trip.duration}</div>
              <div className="w-full h-px bg-blue-200 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200 inline-flex items-center gap-1 whitespace-nowrap">
                  {trip.vehicleType === VehicleType.PLANE ? <Plane className="w-3 h-3" /> : trip.vehicleType === VehicleType.MOTORBIKE ? <Bike className="w-3 h-3" /> : <Bus className="w-3 h-3" />}
                  {trip.vehicleType}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">+ {trip.duration}</div>
              <div className="text-sm font-medium text-slate-600">{trip.to}</div>
            </div>
          </div>

          {/* Amenities */}
          {validAmenities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Tiện ích bao gồm</h3>
              <div className="flex flex-wrap gap-3">
                {validAmenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-700">
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stops Timeline */}
          {trip.stops && trip.stops.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Lịch trình dự kiến</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {trip.stops.map((stop) => (
                  <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {stop.type === 'PICKUP' || stop.type === 'DROP' ? <MapPin className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-slate-800">{stop.location}</div>
                        <div className="text-sm font-medium text-blue-600">{stop.time}</div>
                      </div>
                      <div className="text-sm text-slate-500">{stop.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transport Details (if available) */}
          {trip.transportDetails && (
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Thông tin phương tiện</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border flex items-center gap-3">
                  <div className="p-2 bg-white rounded shadow-sm"><FileText className="w-4 h-4 text-slate-500" /></div>
                  <div>
                    <div className="text-xs text-slate-500">Biển số / Số hiệu</div>
                    <div className="font-medium">{trip.transportDetails.plateNumber}</div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border flex items-center gap-3">
                  <div className="p-2 bg-white rounded shadow-sm"><UserIcon className="w-4 h-4 text-slate-500" /></div>
                  <div>
                    <div className="text-xs text-slate-500">Tài xế / Cơ trưởng</div>
                    <div className="font-medium">{trip.transportDetails.driverName}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Giá vé</div>
            <div className="text-2xl font-bold text-emerald-600">{trip.price.toLocaleString()} đ</div>
          </div>
          <button 
            disabled={trip.availableSeats <= 0}
            onClick={() => {
              onClose();
              onBook(trip);
            }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            {trip.availableSeats <= 0 ? 'Hết chỗ' : 'Đặt vé ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SeatSelector = ({ trip, onConfirm }: { trip: Trip, onConfirm: (seats: string[]) => void }) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seatError, setSeatError] = useState('');

  const isMotorbike = trip.vehicleType === VehicleType.MOTORBIKE;
  const rows = isMotorbike ? ['A'] : ['A', 'B', 'C', 'D'];
  const cols = isMotorbike ? 2 : 5;
  const maxSelectable = Math.min(5, Math.max(0, trip.availableSeats));

  // Tính danh sách ghế đã bán cố định theo trip.id (tránh random lại khi click)
  const soldSeats = useMemo(() => {
    const allSeatIds: string[] = [];
    for (const r of rows) {
      for (let c = 1; c <= cols; c++) {
        allSeatIds.push(`${r}${c}`);
      }
    }

    const totalGrid = allSeatIds.length;
    const ratioSold = trip.totalSeats > 0
      ? Math.max(0, Math.min(1, 1 - trip.availableSeats / trip.totalSeats))
      : 0.2;
    const targetSoldCount = Math.min(totalGrid, Math.round(ratioSold * totalGrid));

    let seed = 0;
    for (let i = 0; i < trip.id.length; i++) {
      seed = (seed * 31 + trip.id.charCodeAt(i)) >>> 0;
    }

    const shuffled = [...allSeatIds].sort((a, b) => {
      const ha = (seed ^ (a.charCodeAt(0) * 17 + a.charCodeAt(1) * 31)) % 97;
      const hb = (seed ^ (b.charCodeAt(0) * 17 + b.charCodeAt(1) * 31)) % 97;
      return ha - hb;
    });

    return new Set(shuffled.slice(0, targetSoldCount));
  }, [trip.id, trip.totalSeats, trip.availableSeats, isMotorbike]);

  const toggleSeat = (seat: string) => {
    setSeatError('');
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(prev => prev.filter(s => s !== seat));
    } else {
      if (selectedSeats.length >= maxSelectable) {
        setSeatError(
          trip.availableSeats < 5
            ? `Chuyến này chỉ còn tối đa ${trip.availableSeats} chỗ trống.`
            : 'Bạn chỉ được đặt tối đa 5 vé một lần.'
        );
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-800">
          {isMotorbike ? 'Chọn chỗ ngồi (Xe Máy)' : 'Chọn ghế ngồi'}
        </h3>
        <p className="text-slate-500 text-sm">
          {trip.vehicleType} - {trip.from} tới {trip.to} (Còn {trip.availableSeats} chỗ)
        </p>
      </div>
      
      <div className="p-8">
        <div className="flex justify-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-200"></div>
            <span className="text-sm text-slate-600">Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600"></div>
            <span className="text-sm text-slate-600">Đang chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-400 opacity-50"></div>
            <span className="text-sm text-slate-600">Đã bán</span>
          </div>
        </div>

        <div className="grid gap-4 justify-center">
          {rows.map(row => (
            <div key={row} className="flex gap-4">
              {Array.from({ length: cols }).map((_, idx) => {
                const seatId = `${row}${idx + 1}`;
                const isSelected = selectedSeats.includes(seatId);
                const isSold = soldSeats.has(seatId);

                return (
                  <button
                    key={seatId}
                    disabled={isSold}
                    onClick={() => toggleSeat(seatId)}
                    className={`w-12 h-12 rounded-lg text-xs font-bold transition flex items-center justify-center
                      ${isSold 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                          : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                  >
                    {seatId}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {seatError && (
          <p className="text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 px-4 mt-6">
            {seatError}
          </p>
        )}
      </div>

      <div className="bg-slate-50 p-6 flex justify-between items-center">
        <div>
          <span className="block text-sm text-slate-500">Ghế đã chọn: {selectedSeats.join(', ') || 'Chưa chọn'}</span>
          <span className="block text-lg font-bold text-blue-600">Tổng: {(selectedSeats.length * trip.price).toLocaleString()} đ</span>
        </div>
        <button
          disabled={selectedSeats.length === 0}
          onClick={() => onConfirm(selectedSeats)}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};
