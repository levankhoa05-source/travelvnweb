import { describe, it, expect } from 'vitest';
import {
  getRouteDistance,
  recommendVehicleByDistance,
  evaluateCancellationPolicy
} from '../../lib/mockData';
import { Ticket, VehicleType } from '../../types';

describe('Unit Test - Tính quãng đường giữa các thành phố (getRouteDistance)', () => {
  it('trả về khoảng cách chính xác cho các tuyến ngắn (1–100 km)', () => {
    expect(getRouteDistance('Đà Nẵng', 'Hội An')).toBe(30);
    expect(getRouteDistance('Hội An', 'Đà Nẵng')).toBe(30);
    expect(getRouteDistance('Hà Nội', 'Ninh Bình')).toBe(93);
    expect(getRouteDistance('TP. Hồ Chí Minh', 'Vũng Tàu')).toBe(95);
  });

  it('trả về khoảng cách chính xác cho các tuyến trung bình và dài', () => {
    expect(getRouteDistance('Hà Nội', 'Hải Phòng')).toBe(120);
    expect(getRouteDistance('TP. Hồ Chí Minh', 'Đà Lạt')).toBe(305);
    expect(getRouteDistance('Đà Nẵng', 'Nha Trang')).toBe(520);
    expect(getRouteDistance('Hà Nội', 'Đà Nẵng')).toBe(765);
    expect(getRouteDistance('Đà Nẵng', 'TP. Hồ Chí Minh')).toBe(950);
    expect(getRouteDistance('Hà Nội', 'TP. Hồ Chí Minh')).toBe(1710);
  });

  it('trả về 0 khi điểm đi trùng điểm đến hoặc thiếu dữ liệu', () => {
    expect(getRouteDistance('Hà Nội', 'Hà Nội')).toBe(0);
    expect(getRouteDistance('', 'Đà Nẵng')).toBe(0);
    expect(getRouteDistance('Hà Nội', '')).toBe(0);
  });
});

describe('Unit Test - Phân vùng tương đương & Giá trị biên Đề xuất phương tiện', () => {
  it('EP1 (Không hợp lệ <= 0 km): biên 0, âm, NaN, Infinity', () => {
    for (const km of [0, -1, -100, Number.NaN, Number.POSITIVE_INFINITY]) {
      const res = recommendVehicleByDistance(km);
      expect(res.valid).toBe(false);
      expect(res.status).toBe('INVALID_LOW');
      expect(res.recommendedTypes).toEqual([]);
    }
  });

  it('EP2 (1–100 km): biên dưới 1, giá trị giữa 50, biên sát 99, biên trên 100 -> Xe Máy', () => {
    for (const km of [1, 2, 50, 99, 100]) {
      const res = recommendVehicleByDistance(km);
      expect(res.valid).toBe(true);
      expect(res.status).toBe('SHORT');
      expect(res.recommendedTypes).toEqual([VehicleType.MOTORBIKE]);
    }
  });

  it('EP3 (101–450 km): biên dưới 101, giữa 250, biên sát 449, biên trên 450 -> Xe Buýt / Xe Khách', () => {
    for (const km of [101, 102, 250, 449, 450]) {
      const res = recommendVehicleByDistance(km);
      expect(res.valid).toBe(true);
      expect(res.status).toBe('MEDIUM');
      expect(res.recommendedTypes).toEqual([VehicleType.BUS, VehicleType.COACH]);
    }
  });

  it('EP4 (451–1000 km): biên dưới 451, giữa 750, biên sát 999, biên trên 1000 -> Máy Bay', () => {
    for (const km of [451, 452, 750, 999, 1000]) {
      const res = recommendVehicleByDistance(km);
      expect(res.valid).toBe(true);
      expect(res.status).toBe('LONG');
      expect(res.recommendedTypes).toEqual([VehicleType.PLANE]);
    }
  });

  it('EP5 (> 1000 km): biên vượt ngưỡng 1001, 1500, 2000 -> OVER_MAX', () => {
    for (const km of [1001, 1500, 2000]) {
      const res = recommendVehicleByDistance(km);
      expect(res.valid).toBe(false);
      expect(res.status).toBe('OVER_MAX');
      expect(res.recommendedTypes).toEqual([VehicleType.PLANE]);
    }
  });

  it('[DEMO-FAIL] Cố tình nhập sai kỳ vọng tại biên 450 km (kỳ vọng Máy Bay thay vì Xe Khách)', () => {
    const res = recommendVehicleByDistance(450);
    // Số liệu cố tình sai để lấy log FAIL cho báo cáo: 450 km thực tế thuộc vùng 101–450 km (Xe Khách/Bus)
    expect(res.recommendedTypes).toEqual([VehicleType.PLANE]);
  });
});

describe('Unit Test - Bảng quyết định Hủy vé & Hoàn tiền (R1–R5)', () => {
  const fixedNow = new Date('2026-11-26T10:00:00').getTime();

  const makeTicket = (
    status: Ticket['status'],
    departureDate: string,
    departureTime: string,
    totalPrice = 1000000
  ): Ticket => ({
    id: 'tk-test-1',
    userId: 'u2',
    tripId: 't1',
    seatNumber: 'A1',
    bookingDate: '2026-11-25T08:00:00.000Z',
    status,
    totalPrice,
    tripDetails: {
      id: 't1',
      from: 'Hà Nội',
      to: 'Đà Nẵng',
      date: departureDate,
      time: departureTime,
      price: totalPrice,
      vehicleId: 'v1',
      vehicleType: VehicleType.PLANE,
      duration: '1h 30m',
      availableSeats: 20,
      totalSeats: 100,
      stops: [],
      amenities: [],
      status: 'APPROVED'
    }
  });

  it('R1: Vé trạng thái CANCELLED -> Từ chối hủy', () => {
    const res = evaluateCancellationPolicy(makeTicket('CANCELLED', '2026-11-30', '10:00'), true, fixedNow);
    expect(res.rule).toBe('R1');
    expect(res.allowed).toBe(false);
    expect(res.refundPercent).toBe(0);
  });

  it('R1b: Vé trạng thái PAID (không phải BOOKED) -> Từ chối hủy', () => {
    const res = evaluateCancellationPolicy(makeTicket('PAID', '2026-11-30', '10:00'), false, fixedNow);
    expect(res.rule).toBe('R1');
    expect(res.allowed).toBe(false);
  });

  it('R2: BOOKED=T, >=24h=F (còn 6h), VIP=F -> Từ chối hủy', () => {
    const res = evaluateCancellationPolicy(makeTicket('BOOKED', '2026-11-26', '16:00', 500000), false, fixedNow);
    expect(res.rule).toBe('R2');
    expect(res.allowed).toBe(false);
    expect(res.isOver24h).toBe(false);
    expect(res.refundAmount).toBe(0);
  });

  it('R3: BOOKED=T, >=24h=F (còn 23h59p), VIP=T -> Hủy & hoàn 80%', () => {
    const res = evaluateCancellationPolicy(makeTicket('BOOKED', '2026-11-27', '09:59', 1000000), true, fixedNow);
    expect(res.rule).toBe('R3');
    expect(res.allowed).toBe(true);
    expect(res.refundPercent).toBe(80);
    expect(res.refundAmount).toBe(800000);
    expect(res.feeAmount).toBe(200000);
  });

  it('R4: BOOKED=T, >=24h=T (đúng mốc 24h), VIP=F -> Hủy & hoàn 80%', () => {
    const res = evaluateCancellationPolicy(makeTicket('BOOKED', '2026-11-27', '10:00', 350000), false, fixedNow);
    expect(res.rule).toBe('R4');
    expect(res.allowed).toBe(true);
    expect(res.isOver24h).toBe(true);
    expect(res.refundPercent).toBe(80);
    expect(res.refundAmount).toBe(280000);
    expect(res.feeAmount).toBe(70000);
  });

  it('R5: BOOKED=T, >=24h=T (còn 48h), VIP=T -> Hủy & hoàn 100%', () => {
    const res = evaluateCancellationPolicy(makeTicket('BOOKED', '2026-11-28', '10:00', 1000000), true, fixedNow);
    expect(res.rule).toBe('R5');
    expect(res.allowed).toBe(true);
    expect(res.refundPercent).toBe(100);
    expect(res.refundAmount).toBe(1000000);
    expect(res.feeAmount).toBe(0);
  });

  it('Khách sạn (checkInDate < 24h): Thường bị từ chối (R2), VIP hoàn 80% (R3)', () => {
    const hotelTicket: Ticket = {
      id: 'tk-hotel-1',
      userId: 'u2',
      hotelId: 'h1',
      roomType: 'Standard Room',
      checkInDate: '2026-11-26',
      bookingDate: '2026-11-25T10:00:00.000Z',
      status: 'BOOKED',
      totalPrice: 1200000
    };
    const r2 = evaluateCancellationPolicy(hotelTicket, false, fixedNow);
    const r3 = evaluateCancellationPolicy(hotelTicket, true, fixedNow);
    expect(r2.rule).toBe('R2');
    expect(r2.allowed).toBe(false);
    expect(r3.rule).toBe('R3');
    expect(r3.refundAmount).toBe(960000);
  });

  it('[DEMO-FAIL] Cố tình nhập sai số tiền hoàn kỳ vọng ở quy tắc R5 (800,000 đ thay vì 1,000,000 đ)', () => {
    const res = evaluateCancellationPolicy(makeTicket('BOOKED', '2026-11-28', '10:00', 1000000), true, fixedNow);
    // Số liệu cố tình sai để lấy log FAIL cho báo cáo
    expect(res.refundAmount).toBe(800000);
  });
});
