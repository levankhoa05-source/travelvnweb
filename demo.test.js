import { describe, it, expect } from 'vitest';

// Giả sử đây là một hàm tính tiền tour trong dự án của bạn
function tinhTienTour(giaVe, soLuong) {
  if (soLuong <= 0) return 0;
  return giaVe * soLuong;
}

// Kịch bản kiểm thử tự động (Test Suite)
describe('Kiểm thử tính năng tính tiền Tour', () => {
  
  it('Tính đúng tổng tiền khi số lượng hợp lệ', () => {
    const ketQua = tinhTienTour(500000, 2);
    expect(ketQua).toBe(1000000); // Mong đợi trả về 1.000.000
  });

  it('Trả về 0 nếu số lượng vé bằng 0 hoặc số âm', () => {
    const ketQua = tinhTienTour(500000, -1);
    expect(ketQua).toBe(0); // Mong đợi trả về 0
  });

});
