import { Trip, User, UserRole, VehicleType, Hotel, TripStop } from '../types';

export const CITIES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Nha Trang', 'Đà Lạt', 'Hải Phòng', 'Cần Thơ'];

export const generatePartners = (): User[] => {
  return [
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
  const startTotalMinutes = hours * 60 + minutes;
  
  // Parse duration rough estimate (e.g., "5h 30m" -> minutes)
  const durHours = parseInt(durationStr.split('h')[0]) || 0;
  const durMins = parseInt(durationStr.split(' ')[1]?.replace('m', '')) || 0;
  const totalDurationMinutes = durHours * 60 + durMins;

  // 1. Pickup
  stops.push({
    id: 'stop-1',
    time: startTime,
    location: type === VehicleType.PLANE ? `Sân bay ${from}` : `Bến xe ${from}`,
    description: type === VehicleType.PLANE ? 'Check-in và làm thủ tục.' : 'Đón khách và xếp hành lý.',
    type: 'PICKUP'
  });

  // 2. Middle stops (Rest/Meal) - Only for long road trips
  if (type !== VehicleType.PLANE && totalDurationMinutes > 240) { // > 4 hours
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

  // 3. Dropoff
  const endTotalMinutes = startTotalMinutes + totalDurationMinutes;
  const eh = Math.floor(endTotalMinutes / 60) % 24;
  const em = endTotalMinutes % 60;

  stops.push({
    id: 'stop-end',
    time: `${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')}`,
    location: type === VehicleType.PLANE ? `Sân bay ${to}` : `Bến xe ${to}`,
    description: 'Trả khách, kết thúc hành trình.',
    type: 'DROP'
  });

  return stops;
};

export const generateTrips = (): Trip[] => {
  const trips: Trip[] = [];
  const roadVehicles = [VehicleType.BUS, VehicleType.COACH];
  
  // Generate Bus/Coach trips
  for (let i = 0; i < 60; i++) {
    const from = CITIES[Math.floor(Math.random() * CITIES.length)];
    let to = CITIES[Math.floor(Math.random() * CITIES.length)];
    while (to === from) to = CITIES[Math.floor(Math.random() * CITIES.length)];

    const type = roadVehicles[Math.floor(Math.random() * roadVehicles.length)];
    const time = `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`;
    const duration = `${4 + Math.floor(Math.random() * 8)}h ${Math.random() > 0.5 ? '00' : '30'}m`;

    // Assign to mock partners (1 or 2)
    const partnerId = Math.random() > 0.5 ? 'partner-1' : 'partner-2';

    trips.push({
      id: `trip-road-${i}`,
      from,
      to,
      date: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time,
      price: Math.floor(150000 + Math.random() * 400000), // 150k - 550k
      vehicleId: `v-road-${i}`,
      vehicleType: type,
      duration,
      availableSeats: Math.floor(Math.random() * 20) + 5,
      totalSeats: 40,
      stops: generateTripStops(from, to, time, duration, type),
      amenities: ['Wifi', 'Nước uống', 'Cổng sạc', 'Bảo hiểm', type === VehicleType.COACH ? 'Chăn đắp' : ''],
      status: 'APPROVED', 
      partnerId: partnerId,
      transportDetails: {
        plateNumber: `29B-${Math.floor(100 + Math.random() * 900)}.${Math.floor(10 + Math.random() * 90)}`,
        driverName: 'Nguyễn Văn Tài',
        driverPhone: '0912345678',
        driverId: '00109000xxxx',
        vehicleDoc: 'doc_verified.png'
      }
    });
  }

  // Generate Plane trips
  for (let i = 0; i < 40; i++) {
    const from = CITIES[Math.floor(Math.random() * CITIES.length)];
    let to = CITIES[Math.floor(Math.random() * CITIES.length)];
    while (to === from) to = CITIES[Math.floor(Math.random() * CITIES.length)];

    const time = `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`;
    const duration = `1h ${15 + Math.floor(Math.random() * 4) * 15}m`;

    // Assign to mock partners (3 or 4)
    const partnerId = Math.random() > 0.5 ? 'partner-3' : 'partner-4';

    trips.push({
      id: `trip-air-${i}`,
      from,
      to,
      date: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time,
      price: Math.floor(1200000 + Math.random() * 2000000), // 1.2m - 3.2m
      vehicleId: `v-air-${i}`,
      vehicleType: VehicleType.PLANE,
      duration,
      availableSeats: Math.floor(Math.random() * 50) + 10,
      totalSeats: 180,
      stops: generateTripStops(from, to, time, duration, VehicleType.PLANE),
      amenities: ['Suất ăn', 'Nước uống', 'Bảo hiểm', 'Tạp chí'],
      status: 'APPROVED',
      partnerId: partnerId,
      transportDetails: {
        plateNumber: `VN${Math.floor(100 + Math.random() * 900)}`,
        driverName: 'Captain Tùng',
        driverPhone: 'N/A',
        driverId: 'N/A',
        vehicleDoc: 'airline_cert.png'
      }
    });
  }
  
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

  for (let i = 0; i < 50; i++) {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    // Randomly assign 0 available rooms to some hotels to test "Sold Out"
    const isSoldOut = Math.random() > 0.85;
    hotels.push({
      id: `hotel-${i}`,
      name: `${hotelNames[Math.floor(Math.random() * hotelNames.length)]} ${city}`,
      city: city,
      address: `${Math.floor(Math.random() * 200) + 1} Đường Nguyễn Huệ, ${city}`,
      pricePerNight: Math.floor(500000 + Math.random() * 3000000),
      rating: 3 + Math.random() * 2,
      image: images[Math.floor(Math.random() * images.length)],
      amenities: amenitiesList.filter(() => Math.random() > 0.4),
      availableRooms: isSoldOut ? 0 : Math.floor(Math.random() * 20) + 2,
      distance: Math.floor(Math.random() * 10) + 1
    });
  }
  return hotels;
};
