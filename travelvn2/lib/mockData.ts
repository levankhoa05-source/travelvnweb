import { Trip, User, UserRole, VehicleType, Hotel, TripStop, Ticket } from '../types';

export const CITIES = [
  'Hà Nội',
  'Ninh Bình',
  'Hải Phòng',
  'Đà Nẵng',
  'Hội An',
  'Nha Trang',
  'Đà Lạt',
  'TP. Hồ Chí Minh',
  'Vũng Tàu',
  'Cần Thơ',
  'Phú Quốc'
];

// Bảng tọa độ các thành phố để tính khoảng cách tuyến đường nhất quán
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Hà Nội': { lat: 21.0285, lng: 105.8542 },
  'Ninh Bình': { lat: 20.2506, lng: 105.9745 },
  'Hải Phòng': { lat: 20.8449, lng: 106.6881 },
  'Đà Nẵng': { lat: 16.0544, lng: 108.2022 },
  'Hội An': { lat: 15.8801, lng: 108.3380 },
  'Nha Trang': { lat: 12.2388, lng: 109.1967 },
  'Đà Lạt': { lat: 11.9404, lng: 108.4583 },
  'TP. Hồ Chí Minh': { lat: 10.8231, lng: 106.6297 },
  'Vũng Tàu': { lat: 10.3460, lng: 107.0843 },
  'Cần Thơ': { lat: 10.0452, lng: 105.7469 },
  'Phú Quốc': { lat: 10.2899, lng: 103.9840 }
};

// Khoảng cách thực tế cho các cặp tuyến tiêu biểu (km)
const ROUTE_DISTANCE_OVERRIDES: Record<string, number> = {
  'Đà Nẵng|Hội An': 30,
  'Hà Nội|Ninh Bình': 93,
  'TP. Hồ Chí Minh|Vũng Tàu': 95,
  'Hà Nội|Hải Phòng': 120,
  'Đà Lạt|Nha Trang': 135,
  'Cần Thơ|TP. Hồ Chí Minh': 170,
  'TP. Hồ Chí Minh|Đà Lạt': 305,
  'Cần Thơ|Phú Quốc': 250,
  'Nha Trang|TP. Hồ Chí Minh': 430,
  'Đà Nẵng|Nha Trang': 520,
  'Đà Lạt|Đà Nẵng': 650,
  'Hà Nội|Đà Nẵng': 765,
  'Đà Nẵng|TP. Hồ Chí Minh': 950,
  'Hà Nội|Nha Trang': 1280,
  'Hà Nội|Đà Lạt': 1480,
  'Hà Nội|TP. Hồ Chí Minh': 1710,
  'Hà Nội|Phú Quốc': 1950
};

/**
 * Tính khoảng cách ước tính (km) giữa 2 thành phố.
 */
export const getRouteDistance = (from: string, to: string): number => {
  if (!from || !to) return 0;
  if (from === to) return 0;

  const key1 = `${from}|${to}`;
  const key2 = `${to}|${from}`;
  if (ROUTE_DISTANCE_OVERRIDES[key1] !== undefined) return ROUTE_DISTANCE_OVERRIDES[key1];
  if (ROUTE_DISTANCE_OVERRIDES[key2] !== undefined) return ROUTE_DISTANCE_OVERRIDES[key2];

  const c1 = CITY_COORDS[from];
  const c2 = CITY_COORDS[to];
  if (!c1 || !c2) return 350;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(c2.lat - c1.lat);
  const dLng = toRad(c2.lng - c1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Nhân hệ số đường bộ ~1.25 để sát thực tế
  return Math.max(1, Math.round(R * c * 1.25));
};

export interface DistanceRecommendation {
  valid: boolean;
  status: 'INVALID_LOW' | 'SHORT' | 'MEDIUM' | 'LONG' | 'OVER_MAX';
  label: string;
  shortVehicleName: string;
  recommendedTypes: VehicleType[];
  message: string;
}

/**
 * Đề xuất phương tiện dựa trên quãng đường (km) theo các phân vùng rõ ràng:
 * - <= 0: Không hợp lệ
 * - 1 - 100 km: Xe Máy
 * - 101 - 450 km: Xe Buýt / Xe Khách
 * - 451 - 1000 km: Máy Bay
 * - > 1000 km: Vượt phạm vi đề xuất xe đường bộ, khuyến nghị Máy Bay
 */
export const recommendVehicleByDistance = (distanceKm: number): DistanceRecommendation => {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return {
      valid: false,
      status: 'INVALID_LOW',
      label: 'Quãng đường không hợp lệ',
      shortVehicleName: '',
      recommendedTypes: [],
      message: 'Quãng đường phải lớn hơn 0 km (tối thiểu 1 km).'
    };
  }

  if (distanceKm <= 100) {
    return {
      valid: true,
      status: 'SHORT',
      label: 'Đề xuất: Xe Máy (1 – 100 km)',
      shortVehicleName: 'Xe Máy',
      recommendedTypes: [VehicleType.MOTORBIKE],
      message: `Quãng đường ${distanceKm} km (1–100 km): Hành khách được đề xuất di chuyển bằng Xe Máy để linh hoạt và nhanh chóng.`
    };
  }

  if (distanceKm <= 450) {
    return {
      valid: true,
      status: 'MEDIUM',
      label: 'Đề xuất: Xe Buýt / Xe Khách (101 – 450 km)',
      shortVehicleName: 'Xe Buýt / Xe Khách',
      recommendedTypes: [VehicleType.BUS, VehicleType.COACH],
      message: `Quãng đường ${distanceKm} km (101–450 km): Hành khách được đề xuất di chuyển bằng Xe Buýt / Xe Khách để an toàn và thoải mái.`
    };
  }

  if (distanceKm <= 1000) {
    return {
      valid: true,
      status: 'LONG',
      label: 'Đề xuất: Máy Bay (451 – 1000 km)',
      shortVehicleName: 'Máy Bay',
      recommendedTypes: [VehicleType.PLANE],
      message: `Quãng đường ${distanceKm} km (451–1000 km): Hành khách được đề xuất di chuyển bằng Máy Bay để tiết kiệm thời gian và thuận tiện.`
    };
  }

  return {
    valid: false,
    status: 'OVER_MAX',
    label: 'Chặng dài (> 1000 km): Chỉ khuyến nghị Máy Bay',
    shortVehicleName: 'Máy Bay',
    recommendedTypes: [VehicleType.PLANE],
    message: `Quãng đường ${distanceKm} km vượt quá ngưỡng 1000 km: Ngoài phạm vi đề xuất phương tiện đường bộ, khuyến nghị đặt vé Máy Bay.`
  };
};

export interface CancellationEvaluation {
  rule: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  allowed: boolean;
  isBooked: boolean;
  isOver24h: boolean;
  isVip: boolean;
  hoursRemaining: number | null;
  refundPercent: 0 | 80 | 100;
  refundAmount: number;
  feeAmount: number;
  message: string;
}

/**
 * Đánh giá chính sách hủy vé & hoàn tiền theo bảng quyết định (R1–R5):
 * - R1: Vé không ở trạng thái BOOKED -> Từ chối hủy
 * - R2: BOOKED=T, >=24h=F, VIP=F -> Từ chối hủy / Báo lỗi
 * - R3: BOOKED=T, >=24h=F, VIP=T -> Cho phép hủy, hoàn 80% (phí hủy 20%)
 * - R4: BOOKED=T, >=24h=T, VIP=F -> Cho phép hủy, hoàn 80% (phí hủy 20%)
 * - R5: BOOKED=T, >=24h=T, VIP=T -> Cho phép hủy, hoàn 100%
 */
export const evaluateCancellationPolicy = (
  ticket: Ticket,
  isVip: boolean,
  nowMs: number = Date.now()
): CancellationEvaluation => {
  const basePrice =
    ticket.totalPrice !== undefined
      ? ticket.totalPrice
      : ticket.tripDetails?.price ?? ticket.hotelDetails?.pricePerNight ?? 0;

  if (ticket.status !== 'BOOKED') {
    return {
      rule: 'R1',
      allowed: false,
      isBooked: false,
      isOver24h: false,
      isVip,
      hoursRemaining: null,
      refundPercent: 0,
      refundAmount: 0,
      feeAmount: 0,
      message: 'Từ chối hủy vé: Vé không ở trạng thái ĐẶT THÀNH CÔNG (BOOKED).'
    };
  }

  let departureMs: number | null = null;
  if (ticket.tripDetails?.date) {
    const timeStr = ticket.tripDetails.time || '00:00';
    const parsed = new Date(`${ticket.tripDetails.date}T${timeStr}:00`).getTime();
    if (Number.isFinite(parsed)) departureMs = parsed;
  } else if (ticket.checkInDate) {
    const parsed = new Date(`${ticket.checkInDate}T14:00:00`).getTime();
    if (Number.isFinite(parsed)) departureMs = parsed;
  }

  // Mặc định coi là >= 24h nếu dữ liệu thiếu ngày giờ khởi hành
  const hoursRemaining =
    departureMs !== null ? (departureMs - nowMs) / (1000 * 60 * 60) : 48;
  const isOver24h = hoursRemaining >= 24;

  if (!isOver24h && !isVip) {
    return {
      rule: 'R2',
      allowed: false,
      isBooked: true,
      isOver24h: false,
      isVip: false,
      hoursRemaining,
      refundPercent: 0,
      refundAmount: 0,
      feeAmount: 0,
      message:
        'Từ chối hủy vé: Không thể hủy trong vòng 24 giờ trước giờ khởi hành đối với tài khoản Thường.'
    };
  }

  if (!isOver24h && isVip) {
    const refundAmount = Math.round(basePrice * 0.8);
    return {
      rule: 'R3',
      allowed: true,
      isBooked: true,
      isOver24h: false,
      isVip: true,
      hoursRemaining,
      refundPercent: 80,
      refundAmount,
      feeAmount: basePrice - refundAmount,
      message: `Đặc quyền VIP (hủy < 24h): Được phép hủy vé và hoàn 80% tiền vé (${refundAmount.toLocaleString()} đ, trừ 20% phí hủy).`
    };
  }

  if (isOver24h && !isVip) {
    const refundAmount = Math.round(basePrice * 0.8);
    return {
      rule: 'R4',
      allowed: true,
      isBooked: true,
      isOver24h: true,
      isVip: false,
      hoursRemaining,
      refundPercent: 80,
      refundAmount,
      feeAmount: basePrice - refundAmount,
      message: `Hủy trước >= 24h (Thành viên Thường): Được phép hủy vé và hoàn 80% tiền vé (${refundAmount.toLocaleString()} đ, trừ 20% phí hủy).`
    };
  }

  return {
    rule: 'R5',
    allowed: true,
    isBooked: true,
    isOver24h: true,
    isVip: true,
    hoursRemaining,
    refundPercent: 100,
    refundAmount: basePrice,
    feeAmount: 0,
    message: `Đặc quyền VIP (hủy >= 24h): Được phép hủy vé và hoàn 100% tiền vé (${basePrice.toLocaleString()} đ).`
  };
};

export const generatePartners = (): User[] => {
  return [
    { id: 'p1', name: 'Nhà xe Phương Trang', email: 'phuongtrang@travel.vn', role: UserRole.PARTNER, status: 'ACTIVE', phone: '19006067' },
    { id: 'partner-1', name: 'Nhà Xe Thành Bưởi', email: 'partner1@travelvn.com', role: UserRole.PARTNER, status: 'ACTIVE', phone: '0909123456' },
    { id: 'partner-2', name: 'Hãng Xe Phương Trang', email: 'partner2@travelvn.com', role: UserRole.PARTNER, status: 'ACTIVE', phone: '0909654321' },
    { id: 'partner-3', name: 'Bamboo Airways', email: 'bamboo@travelvn.com', role: UserRole.PARTNER, status: 'ACTIVE', phone: '19001111' },
    { id: 'partner-4', name: 'VietJet Air', email: 'vietjet@travelvn.com', role: UserRole.PARTNER, status: 'ACTIVE', phone: '19002222' },
    { id: 'partner-bad', name: 'Xe Khách Kém Chất Lượng', email: 'bad@travelvn.com', role: UserRole.PARTNER, status: 'BANNED', banUntil: null, phone: '0900000000' }
  ];
};

export const generateTripStops = (from: string, to: string, startTime: string, durationStr: string, type: VehicleType): TripStop[] => {
  const stops: TripStop[] = [];
  const [hours, minutes] = startTime.split(':').map(Number);
  const startTotalMinutes = (hours || 0) * 60 + (minutes || 0);

  const durHours = parseInt(durationStr.split('h')[0]) || 0;
  const durMins = parseInt(durationStr.split(' ')[1]?.replace('m', '')) || 0;
  const totalDurationMinutes = durHours * 60 + durMins;

  stops.push({
    id: 'stop-1',
    time: startTime,
    location:
      type === VehicleType.PLANE
        ? `Sân bay ${from}`
        : type === VehicleType.MOTORBIKE
          ? `Điểm hẹn trung tâm ${from}`
          : `Bến xe ${from}`,
    description:
      type === VehicleType.PLANE
        ? 'Check-in và làm thủ tục.'
        : type === VehicleType.MOTORBIKE
          ? 'Kiểm tra mũ bảo hiểm và xuất phát.'
          : 'Đón khách và xếp hành lý.',
    type: 'PICKUP'
  });

  if (type !== VehicleType.PLANE && type !== VehicleType.MOTORBIKE && totalDurationMinutes > 240) {
    const restTimeMinutes = startTotalMinutes + Math.floor(totalDurationMinutes / 2);
    const rh = Math.floor(restTimeMinutes / 60) % 24;
    const rm = restTimeMinutes % 60;
    stops.push({
      id: 'stop-2',
      time: `${rh.toString().padStart(2, '0')}:${rm.toString().padStart(2, '0')}`,
      location: 'Trạm dừng nghỉ',
      description: 'Nghỉ ngơi, ăn uống và vệ sinh cá nhân (30 phút).',
      type: 'MEAL'
    });
  }

  const endTotalMinutes = startTotalMinutes + totalDurationMinutes;
  const eh = Math.floor(endTotalMinutes / 60) % 24;
  const em = endTotalMinutes % 60;

  stops.push({
    id: 'stop-end',
    time: `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`,
    location:
      type === VehicleType.PLANE
        ? `Sân bay ${to}`
        : type === VehicleType.MOTORBIKE
          ? `Trung tâm ${to}`
          : `Bến xe ${to}`,
    description: 'Trả khách, kết thúc hành trình.',
    type: 'DROP'
  });

  return stops;
};

const formatDateOffset = (daysOffset: number): string => {
  return new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

const formatDurationFromDistance = (distance: number, type: VehicleType): string => {
  const speed = type === VehicleType.PLANE ? 650 : type === VehicleType.MOTORBIKE ? 45 : 60;
  const totalMinutes = Math.max(30, Math.round((distance / speed) * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};

export const generateTrips = (): Trip[] => {
  const trips: Trip[] = [];
  let idx = 0;

  const createTrip = (from: string, to: string, type: VehicleType, daysOffset: number, time: string): Trip => {
    idx += 1;
    const distance = getRouteDistance(from, to);
    const duration = formatDurationFromDistance(distance, type);
    const isPlane = type === VehicleType.PLANE;
    const isMotorbike = type === VehicleType.MOTORBIKE;

    const totalSeats = isPlane ? 180 : isMotorbike ? 2 : 40;
    const availableSeats = isPlane
      ? 25 + (idx % 60)
      : isMotorbike
        ? 1 + (idx % 2)
        : 8 + (idx % 25);

    const price = isPlane
      ? 1100000 + (distance * 1100) + ((idx % 5) * 100000)
      : isMotorbike
        ? 60000 + distance * 1500
        : 140000 + distance * 900;

    const amenities = isPlane
      ? ['Suất ăn', 'Nước uống', 'Bảo hiểm', 'Tạp chí']
      : isMotorbike
        ? ['Mũ bảo hiểm', 'Áo mưa', 'Nước uống', 'Bảo hiểm']
        : ['Wifi', 'Nước uống', 'Cổng sạc', 'Bảo hiểm', ...(type === VehicleType.COACH ? ['Chăn đắp'] : [])];

    const partnerId = isPlane ? (idx % 2 === 0 ? 'partner-3' : 'partner-4') : (idx % 3 === 0 ? 'p1' : idx % 2 === 0 ? 'partner-1' : 'partner-2');

    return {
      id: `trip-${type}-${idx}`,
      from,
      to,
      date: formatDateOffset(daysOffset),
      time,
      price: Math.round(price / 1000) * 1000,
      vehicleId: `v-${idx}`,
      vehicleType: type,
      duration,
      availableSeats,
      totalSeats,
      distance,
      stops: generateTripStops(from, to, time, duration, type),
      amenities,
      status: 'APPROVED',
      partnerId,
      transportDetails: {
        plateNumber: isPlane
          ? `VN${200 + (idx % 700)}`
          : isMotorbike
            ? `29H1-${100 + (idx % 800)}.${10 + (idx % 89)}`
            : `29B-${100 + (idx % 800)}.${10 + (idx % 89)}`,
        driverName: isPlane ? 'Captain Tùng' : 'Nguyễn Văn Tài',
        driverPhone: isPlane ? 'N/A' : '0912345678',
        driverId: isPlane ? 'N/A' : '00109000xxxx',
        vehicleDoc: isPlane ? 'airline_cert.png' : 'doc_verified.png'
      }
    };
  };

  // Các tuyến ngắn tiêu biểu (1 - 100 km) -> có Xe Máy & Xe Khách
  const shortRoutes: [string, string][] = [
    ['Đà Nẵng', 'Hội An'],
    ['Hội An', 'Đà Nẵng'],
    ['Hà Nội', 'Ninh Bình'],
    ['Ninh Bình', 'Hà Nội'],
    ['TP. Hồ Chí Minh', 'Vũng Tàu'],
    ['Vũng Tàu', 'TP. Hồ Chí Minh']
  ];
  shortRoutes.forEach(([from, to], rIdx) => {
    trips.push(createTrip(from, to, VehicleType.MOTORBIKE, 0, '23:30')); // < 24h để test R2/R3
    trips.push(createTrip(from, to, VehicleType.MOTORBIKE, 2 + (rIdx % 3), '08:30')); // >= 24h để test R4/R5
    trips.push(createTrip(from, to, VehicleType.BUS, 2 + (rIdx % 3), '09:00'));
  });

  // Các tuyến trung bình (101 - 450 km) -> Xe Khách & Bus Giường Nằm
  const mediumRoutes: [string, string][] = [
    ['Hà Nội', 'Hải Phòng'],
    ['Hải Phòng', 'Hà Nội'],
    ['TP. Hồ Chí Minh', 'Cần Thơ'],
    ['Cần Thơ', 'TP. Hồ Chí Minh'],
    ['TP. Hồ Chí Minh', 'Đà Lạt'],
    ['Đà Lạt', 'TP. Hồ Chí Minh'],
    ['Nha Trang', 'Đà Lạt'],
    ['Đà Lạt', 'Nha Trang'],
    ['TP. Hồ Chí Minh', 'Nha Trang'],
    ['Nha Trang', 'TP. Hồ Chí Minh'],
    ['Cần Thơ', 'Phú Quốc']
  ];
  mediumRoutes.forEach(([from, to], rIdx) => {
    trips.push(createTrip(from, to, VehicleType.BUS, 0, '23:45')); // < 24h để test R2/R3
    trips.push(createTrip(from, to, VehicleType.BUS, 2 + (rIdx % 4), '08:00')); // >= 24h
    trips.push(createTrip(from, to, VehicleType.COACH, 2 + ((rIdx + 1) % 4), '21:30'));
  });

  // Các tuyến dài (451 - 1000 km và > 1000 km) -> Máy Bay + một số Bus Giường Nằm
  const longRoutes: [string, string][] = [
    ['Đà Nẵng', 'Nha Trang'],
    ['Hà Nội', 'Đà Nẵng'],
    ['Đà Nẵng', 'Hà Nội'],
    ['Đà Nẵng', 'TP. Hồ Chí Minh'],
    ['TP. Hồ Chí Minh', 'Đà Nẵng'],
    ['TP. Hồ Chí Minh', 'Phú Quốc'],
    ['Hà Nội', 'TP. Hồ Chí Minh'],
    ['TP. Hồ Chí Minh', 'Hà Nội'],
    ['Hà Nội', 'Đà Lạt'],
    ['Hà Nội', 'Phú Quốc'],
    ['Hà Nội', 'Nha Trang']
  ];
  longRoutes.forEach(([from, to], rIdx) => {
    trips.push(createTrip(from, to, VehicleType.PLANE, 0, '23:50')); // < 24h để test R2/R3
    trips.push(createTrip(from, to, VehicleType.PLANE, 2 + (rIdx % 5), '09:15'));
    trips.push(createTrip(from, to, VehicleType.PLANE, 3 + (rIdx % 4), '16:45'));
    if (getRouteDistance(from, to) <= 1000) {
      trips.push(createTrip(from, to, VehicleType.COACH, 2 + ((rIdx + 1) % 5), '19:00'));
    }
  });

  return trips.sort((a, b) => a.time.localeCompare(b.time));
};

export const generateHotels = (): Hotel[] => {
  const hotels: Hotel[] = [];
  const hotelNames = ['Grand Hotel', 'Sunrise Resort', 'Blue Sky Hotel', 'City View Hostel', 'Luxury Palace', 'Ocean Breeze'];
  const amenitiesList = ['Wifi', 'Pool', 'Breakfast', 'Gym', 'Spa', 'Bar'];
  const images = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80'
  ];

  // Đảm bảo mỗi thành phố đều có ít nhất 4 khách sạn (gồm cả trường hợp còn phòng & hết phòng)
  let idCounter = 0;
  CITIES.forEach((city, cIdx) => {
    for (let j = 0; j < 4; j++) {
      const isSoldOut = j === 3 && cIdx % 2 === 0;
      const idx = idCounter++;
      hotels.push({
        id: `hotel-${idx}`,
        name: `${hotelNames[(idx + j) % hotelNames.length]} ${city}`,
        city,
        address: `${15 + idx * 7} Đường Nguyễn Huệ, ${city}`,
        pricePerNight: 550000 + ((idx * 230000) % 2800000),
        rating: Number((3.4 + ((idx * 3) % 16) / 10).toFixed(1)),
        image: images[idx % images.length],
        amenities: amenitiesList.filter((_, aIdx) => (idx + aIdx) % 2 === 0 || aIdx === 0),
        availableRooms: isSoldOut ? 0 : 3 + (idx % 18),
        distance: Number((0.5 + ((idx * 7) % 85) / 10).toFixed(1))
      });
    }
  });

  return hotels;
};
