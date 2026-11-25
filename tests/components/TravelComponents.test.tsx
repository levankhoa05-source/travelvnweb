import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchHero } from '../../components/HomeWidgets';
import { SeatSelector } from '../../components/Modals';
import { PaymentView, PromotionsPage } from '../../components/CoreViews';
import { Hotel, Trip, VehicleType } from '../../types';

const sampleBusTrip: Trip = {
  id: 'trip-bus-1',
  from: 'TP. Hồ Chí Minh',
  to: 'Đà Lạt',
  date: '2026-12-10',
  time: '08:00',
  price: 300000,
  vehicleId: 'v-1',
  vehicleType: VehicleType.BUS,
  duration: '6h 00m',
  availableSeats: 20,
  totalSeats: 20,
  stops: [],
  amenities: ['Wifi'],
  status: 'APPROVED'
};

const samplePlaneTrip: Trip = {
  ...sampleBusTrip,
  id: 'trip-plane-1',
  vehicleType: VehicleType.PLANE,
  price: 1500000
};

const sampleMotorbikeTrip: Trip = {
  ...sampleBusTrip,
  id: 'trip-moto-1',
  from: 'Đà Nẵng',
  to: 'Hội An',
  vehicleType: VehicleType.MOTORBIKE,
  price: 80000,
  totalSeats: 2,
  availableSeats: 2
};

const sampleHotel: Hotel = {
  id: 'hotel-1',
  name: 'Sunrise Resort Đà Nẵng',
  city: 'Đà Nẵng',
  address: '123 Võ Nguyên Giáp',
  pricePerNight: 1000000,
  rating: 4.7,
  image: 'https://picsum.photos/200',
  amenities: ['Wifi', 'Pool'],
  availableRooms: 5,
  distance: 1.5
};

describe('Component Test - SearchHero (Đề xuất quãng đường & Validate)', () => {
  it('tự động tính quãng đường Đà Nẵng -> Hội An (30 km) và đề xuất Xe Máy', () => {
    const onSearch = vi.fn();
    render(<SearchHero onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText('Điểm đi'), { target: { value: 'Đà Nẵng' } });
    fireEvent.change(screen.getByLabelText('Điểm đến'), { target: { value: 'Hội An' } });

    const distanceInput = screen.getByLabelText('Quãng đường (km)') as HTMLInputElement;
    expect(distanceInput.value).toBe('30');
    expect(screen.getByText(/Đề xuất: Xe Máy \(1 – 100 km\)/i)).toBeInTheDocument();
  });

  it('hiển thị đúng đề xuất cho từng phân vùng 101–450 km, 451–1000 km và >1000 km', () => {
    render(<SearchHero onSearch={vi.fn()} />);
    const distanceInput = screen.getByLabelText('Quãng đường (km)');

    fireEvent.change(distanceInput, { target: { value: '300' } });
    expect(screen.getByText(/Đề xuất: Xe Buýt \/ Xe Khách \(101 – 450 km\)/i)).toBeInTheDocument();

    fireEvent.change(distanceInput, { target: { value: '700' } });
    expect(screen.getByText(/Đề xuất: Máy Bay \(451 – 1000 km\)/i)).toBeInTheDocument();

    fireEvent.change(distanceInput, { target: { value: '1200' } });
    expect(screen.getByText(/Chặng dài \(> 1000 km\): Chỉ khuyến nghị Máy Bay/i)).toBeInTheDocument();
  });

  it('nút Lọc theo đề xuất kích hoạt tìm kiếm đúng loại phương tiện', () => {
    const onSearch = vi.fn();
    render(<SearchHero onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText('Quãng đường (km)'), { target: { value: '80' } });
    fireEvent.click(screen.getByRole('button', { name: /Lọc theo Xe Máy/i }));

    expect(onSearch).toHaveBeenCalledWith(
      'transport',
      expect.objectContaining({ type: VehicleType.MOTORBIKE, distance: 80 })
    );
  });

  it('báo lỗi khi chọn Điểm đi trùng Điểm đến, quãng đường <= 0 hoặc ngày quá khứ', () => {
    const onSearch = vi.fn();
    render(<SearchHero onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText('Điểm đi'), { target: { value: 'Hà Nội' } });
    fireEvent.change(screen.getByLabelText('Điểm đến'), { target: { value: 'Hà Nội' } });
    fireEvent.click(screen.getByRole('button', { name: /Tìm kiếm ngay/i }));
    expect(screen.getByText('Điểm đi và điểm đến không được trùng nhau.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Điểm đến'), { target: { value: 'Đà Nẵng' } });
    fireEvent.change(screen.getByLabelText('Ngày đi'), { target: { value: '2020-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Tìm kiếm ngay/i }));
    expect(screen.getByText('Không thể chọn ngày đi trong quá khứ.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Ngày đi'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Quãng đường (km)'), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: /Tìm kiếm ngay/i }));
    expect(screen.getByText('Quãng đường phải là số hợp lệ lớn hơn 0 km.')).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('chuyển sang tab Khách sạn và chặn ngày nhận phòng trong quá khứ', () => {
    const onSearch = vi.fn();
    render(<SearchHero onSearch={onSearch} />);

    fireEvent.click(screen.getByRole('button', { name: /Khách sạn/i }));
    fireEvent.change(screen.getByLabelText('Ngày nhận phòng'), { target: { value: '2020-05-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Tìm khách sạn/i }));

    expect(screen.getByText('Không thể chọn ngày nhận phòng trong quá khứ.')).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
  });
});

describe('Component Test - SeatSelector (Giá trị biên chọn 1–5 ghế)', () => {
  it('chọn và bỏ chọn ghế cập nhật trạng thái nút Tiếp tục & tổng tiền', () => {
    const onConfirm = vi.fn();
    render(<SeatSelector trip={sampleBusTrip} onConfirm={onConfirm} />);

    const continueBtn = screen.getByRole('button', { name: 'Tiếp tục' });
    expect(continueBtn).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'A1' }));
    expect(continueBtn).not.toBeDisabled();
    expect(screen.getByText(/Tổng: 300,000 đ/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'A1' }));
    expect(continueBtn).toBeDisabled();
    expect(screen.getByText(/Ghế đã chọn: Chưa chọn/)).toBeInTheDocument();
  });

  it('giới hạn tối đa 5 ghế mỗi lần đặt', () => {
    const onConfirm = vi.fn();
    render(<SeatSelector trip={sampleBusTrip} onConfirm={onConfirm} />);

    for (const seat of ['A1', 'A2', 'A3', 'A4', 'A5']) {
      fireEvent.click(screen.getByRole('button', { name: seat }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'B1' }));
    expect(screen.getByText('Bạn chỉ được đặt tối đa 5 vé một lần.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(onConfirm).toHaveBeenCalledWith(['A1', 'A2', 'A3', 'A4', 'A5']);
  });

  it('hiển thị sơ đồ 2 chỗ cho Xe Máy', () => {
    render(<SeatSelector trip={sampleMotorbikeTrip} onConfirm={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'A1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'A2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'A3' })).not.toBeInTheDocument();
  });
});

describe('Component Test - PaymentView & PromotionsPage', () => {
  it('áp dụng đúng các mã FLY20 (Máy Bay), HOTEL2024 (Khách sạn), NEWBIE100 (không âm)', () => {
    const onSuccess = vi.fn();
    const { rerender } = render(
      <PaymentView
        selectedTrip={samplePlaneTrip}
        selectedHotel={null}
        bookingSeats={['A1']}
        onPaymentSuccess={onSuccess}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Nhập mã ưu đãi...'), { target: { value: 'fly20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận thanh toán/i }));
    expect(onSuccess).toHaveBeenCalledWith(1200000);

    const onHotelSuccess = vi.fn();
    rerender(
      <PaymentView
        selectedTrip={null}
        selectedHotel={sampleHotel}
        bookingSeats={['Standard Room']}
        onPaymentSuccess={onHotelSuccess}
        onCancel={vi.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Nhập mã ưu đãi...'), { target: { value: 'HOTEL2024' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận thanh toán/i }));
    expect(onHotelSuccess).toHaveBeenCalledWith(850000);

    const onMotoSuccess = vi.fn();
    rerender(
      <PaymentView
        selectedTrip={sampleMotorbikeTrip}
        selectedHotel={null}
        bookingSeats={['A1']}
        onPaymentSuccess={onMotoSuccess}
        onCancel={vi.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Nhập mã ưu đãi...'), { target: { value: 'NEWBIE100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận thanh toán/i }));
    expect(onMotoSuccess).toHaveBeenCalledWith(0); // 80,000 - 100,000 -> clamp về 0
  });

  it('kiểm tra validate email đăng ký nhận bản tin ở PromotionsPage', () => {
    render(<PromotionsPage onCopy={vi.fn()} savedPromos={[]} showNotification={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn...'), { target: { value: 'email-sai' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký ngay' }));
    expect(screen.getByText('Vui lòng nhập địa chỉ email hợp lệ.')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Nhập email của bạn...'), { target: { value: 'user@travel.vn' } });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký ngay' }));
    expect(screen.getByText('Đã đăng ký nhận ưu đãi cho email user@travel.vn!')).toBeInTheDocument();
  });

  it('tính tổng tiền sau khi áp dụng mã giảm giá BUS50 cho Xe Khách', () => {
    const onSuccess = vi.fn();
    render(
      <PaymentView
        selectedTrip={sampleBusTrip}
        selectedHotel={null}
        bookingSeats={['A1']}
        onPaymentSuccess={onSuccess}
        onCancel={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Nhập mã ưu đãi...'), { target: { value: 'BUS50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áp dụng' }));
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận thanh toán/i }));

    expect(onSuccess).toHaveBeenCalledWith(200000);
  });
});
