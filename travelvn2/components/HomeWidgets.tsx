import React, { useState, useEffect } from 'react';
import {
  Bus,
  Plane,
  Bike,
  Building2,
  Search,
  MapPin,
  Calendar,
  Tag,
  Copy,
  Star,
  ArrowRight,
  Clock,
  CheckCircle,
  Route,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { SearchMode, VehicleType } from '../types';
import { CITIES, getRouteDistance, recommendVehicleByDistance } from '../lib/mockData';

interface SearchHeroProps {
  onSearch: (mode: SearchMode, criteria: any) => void;
}

interface PromotionProps {
  onCopy: (code: string) => void;
  savedPromos: string[];
}

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch }) => {
  const [mode, setMode] = useState<SearchMode>('transport');

  // Transport State
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [distanceInput, setDistanceInput] = useState('');
  const [searchError, setSearchError] = useState('');

  // Hotel State
  const [hotelCity, setHotelCity] = useState('');
  const [checkIn, setCheckIn] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Tự động cập nhật quãng đường ước tính khi chọn cặp Điểm đi - Điểm đến
  useEffect(() => {
    if (from && to && from !== to) {
      setDistanceInput(String(getRouteDistance(from, to)));
      setSearchError('');
    } else if (from && to && from === to) {
      setDistanceInput('0');
    } else if (!from && !to) {
      setDistanceInput('');
    }
  }, [from, to]);

  const parsedDistance = distanceInput.trim() === '' ? null : Number(distanceInput);
  const recommendation =
    parsedDistance !== null ? recommendVehicleByDistance(parsedDistance) : null;

  const handleSearchClick = (overrideType?: string) => {
    setSearchError('');

    if (mode === 'transport') {
      if (from && to && from === to) {
        setSearchError('Điểm đi và điểm đến không được trùng nhau.');
        return;
      }
      if (date && date < today) {
        setSearchError('Không thể chọn ngày đi trong quá khứ.');
        return;
      }
      if (distanceInput.trim() !== '') {
        if (parsedDistance === null || !Number.isFinite(parsedDistance) || parsedDistance <= 0) {
          setSearchError('Quãng đường phải là số hợp lệ lớn hơn 0 km.');
          return;
        }
      }

      const activeType = overrideType ?? type;
      onSearch('transport', {
        from,
        to,
        date,
        type: activeType,
        timeRange,
        distance: parsedDistance
      });
    } else {
      if (checkIn && checkIn < today) {
        setSearchError('Không thể chọn ngày nhận phòng trong quá khứ.');
        return;
      }
      onSearch('hotel', { city: hotelCity, checkIn });
    }
  };

  const applyRecommendedFilter = () => {
    if (!recommendation || recommendation.recommendedTypes.length === 0) return;
    const nextType =
      recommendation.recommendedTypes.length > 1
        ? 'BUS_GROUP'
        : recommendation.recommendedTypes[0];
    setType(nextType);
    handleSearchClick(nextType);
  };

  const renderRecommendationIcon = () => {
    if (!recommendation) return <Route className="h-5 w-5" />;
    if (recommendation.status === 'SHORT') return <Bike className="h-5 w-5 text-emerald-600" />;
    if (recommendation.status === 'MEDIUM') return <Bus className="h-5 w-5 text-orange-600" />;
    if (recommendation.status === 'LONG' || recommendation.status === 'OVER_MAX') {
      return <Plane className="h-5 w-5 text-sky-600" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="relative bg-slate-900 py-16 sm:py-24 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={
            mode === 'transport'
              ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1950&q=80'
              : 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1950&q=80'
          }
          alt="Travel background"
          className="w-full h-full object-cover opacity-40 scale-105 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="text-center mb-8 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
            {mode === 'transport' ? 'Vi vu muôn nơi' : 'Nghỉ dưỡng tuyệt vời'} <br />
            <span className="text-blue-400">
              {mode === 'transport' ? 'Cùng TravelVN' : 'Tại khách sạn đẳng cấp'}
            </span>
          </h1>
        </div>

        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
          <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-2">
            <button
              onClick={() => {
                setMode('transport');
                setSearchError('');
              }}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${
                mode === 'transport'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Bus className="h-5 w-5" /> Vé xe & Máy bay
            </button>
            <button
              onClick={() => {
                setMode('hotel');
                setSearchError('');
              }}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${
                mode === 'hotel'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Building2 className="h-5 w-5" /> Khách sạn
            </button>
          </div>

          {mode === 'transport' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                    Điểm đi
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <MapPin className="h-5 w-5 text-blue-500 mr-2 shrink-0" />
                    <select
                      aria-label="Điểm đi"
                      className="bg-transparent w-full font-semibold focus:outline-none"
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        setSearchError('');
                      }}
                    >
                      <option value="">Chọn nơi đi</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                    Điểm đến
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <MapPin className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    <select
                      aria-label="Điểm đến"
                      className="bg-transparent w-full font-semibold focus:outline-none"
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        setSearchError('');
                      }}
                    >
                      <option value="">Chọn nơi đến</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                    Ngày đi
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <Calendar className="h-5 w-5 text-slate-400 mr-2 shrink-0" />
                    <input
                      aria-label="Ngày đi"
                      type="date"
                      min={today}
                      className="bg-transparent w-full font-semibold focus:outline-none"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setSearchError('');
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                    Quãng đường (km)
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <Route className="h-5 w-5 text-indigo-500 mr-2 shrink-0" />
                    <input
                      aria-label="Quãng đường (km)"
                      type="number"
                      placeholder="Tự tính hoặc nhập số km..."
                      className="bg-transparent w-full font-semibold focus:outline-none"
                      value={distanceInput}
                      onChange={(e) => {
                        setDistanceInput(e.target.value);
                        setSearchError('');
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                    Phương tiện
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <Bus className="h-5 w-5 text-orange-500 mr-2 shrink-0" />
                    <select
                      aria-label="Phương tiện"
                      className="bg-transparent w-full font-semibold focus:outline-none"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="all">Tất cả phương tiện</option>
                      <option value={VehicleType.MOTORBIKE}>Xe Máy (1–100 km)</option>
                      <option value="BUS_GROUP">Xe Buýt / Xe Khách (101–450 km)</option>
                      <option value={VehicleType.BUS}>Xe Khách</option>
                      <option value={VehicleType.COACH}>Bus Giường Nằm</option>
                      <option value={VehicleType.PLANE}>Máy Bay (451–1000+ km)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                    Khung giờ
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <Clock className="h-5 w-5 text-slate-400 mr-2 shrink-0" />
                    <select
                      aria-label="Khung giờ"
                      className="bg-transparent w-full font-semibold focus:outline-none"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="all">Mọi khung giờ</option>
                      <option value="00:00-11:59">Buổi sáng (00:00 - 11:59)</option>
                      <option value="12:00-17:59">Buổi chiều (12:00 - 17:59)</option>
                      <option value="18:00-23:59">Buổi tối (18:00 - 23:59)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Hộp đề xuất phương tiện theo quãng đường */}
              {recommendation && (
                <div
                  className={`rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    recommendation.status === 'INVALID_LOW'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : recommendation.status === 'OVER_MAX'
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-blue-50 border-blue-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                      {renderRecommendationIcon()}
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        {recommendation.label}
                      </div>
                      <p className="text-xs mt-0.5 opacity-90">{recommendation.message}</p>
                    </div>
                  </div>

                  {recommendation.recommendedTypes.length > 0 && (
                    <button
                      type="button"
                      onClick={applyRecommendedFilter}
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold whitespace-nowrap shadow-sm transition"
                    >
                      Lọc theo {recommendation.shortVehicleName}
                    </button>
                  )}
                </div>
              )}

              {searchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              <button
                onClick={() => handleSearchClick()}
                className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center transition shadow-lg mt-2"
              >
                <Search className="h-5 w-5 mr-2" /> Tìm kiếm ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                    Thành phố
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                    <select
                      aria-label="Thành phố"
                      className="bg-transparent w-full font-semibold focus:outline-none"
                      value={hotelCity}
                      onChange={(e) => setHotelCity(e.target.value)}
                    >
                      <option value="">Chọn thành phố</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">
                    Ngày nhận phòng
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                    <input
                      aria-label="Ngày nhận phòng"
                      type="date"
                      min={today}
                      className="bg-transparent w-full font-semibold focus:outline-none"
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        setSearchError('');
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => handleSearchClick()}
                    className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center transition shadow-lg"
                  >
                    <Search className="h-5 w-5 mr-2" /> Tìm khách sạn
                  </button>
                </div>
              </div>

              {searchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PromotionSection: React.FC<PromotionProps> = ({ onCopy, savedPromos }) => (
  <div className="py-12">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Tag className="h-6 w-6 text-red-500" /> Ưu đãi nổi bật
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: 'Giảm 20% vé máy bay', code: 'FLY20', color: 'bg-blue-500' },
        { title: 'Giảm 50k vé xe khách', code: 'BUS50', color: 'bg-orange-500' },
        { title: 'Combo Khách sạn Hè', code: 'HOTEL2024', color: 'bg-purple-500' }
      ].map((promo, i) => {
        const isSaved = savedPromos.includes(promo.code);
        return (
          <div
            key={i}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-1">{promo.title}</h3>
            <div className="flex items-center gap-2 mt-4">
              <span className="bg-slate-100 px-3 py-1 rounded text-xs font-mono font-bold border border-dashed border-slate-300">
                {promo.code}
              </span>
              <button
                onClick={() => !isSaved && onCopy(promo.code)}
                className={`text-xs font-bold flex items-center gap-1 ${
                  isSaved ? 'text-slate-400' : 'text-blue-600 hover:underline'
                }`}
              >
                {isSaved ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {isSaved ? 'Đã lưu' : 'Lưu mã'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export const PopularDestinations = ({ onExplore }: { onExplore: (city: string) => void }) => {
  const destinations = [
    {
      name: 'Hội An',
      img: 'https://lasiestaresorts.com/wp-content/uploads/2025/09/History-of-Hoi-An-Ancient-Town-Told-In-Reverse-La-Siesta-Hoi-An.jpg'
    },
    {
      name: 'Đà Nẵng',
      img: 'https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA'
    },
    {
      name: 'Đà Lạt',
      img: 'https://cdtour.vn/wp-content/uploads/2025/05/Da-lat.webp'
    },
    {
      name: 'Phú Quốc',
      img: 'https://bcp.cdnchinhphu.vn/334894974524682240/2025/6/23/phu-quoc-17506756503251936667562.jpg'
    }
  ];

  return (
    <div className="py-12 border-t border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
        <Star className="h-6 w-6 text-yellow-500" /> Điểm đến hàng đầu
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {destinations.map((dest, i) => (
          <div
            key={i}
            className="group relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer shadow-lg"
            onClick={() => onExplore(dest.name)}
          >
            <img
              src={dest.img}
              alt={dest.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700 bg-slate-200"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://placehold.co/600x800/1e293b/white?text=${encodeURIComponent(dest.name)}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
              <div className="transform transition-all group-hover:translate-x-1">
                <span className="text-white font-bold text-xl block">{dest.name}</span>
                <span className="text-white/80 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Khám phá <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
