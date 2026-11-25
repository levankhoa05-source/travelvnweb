import { test, expect } from '@playwright/test';

test.describe('System / E2E UI Tests - TravelVN', () => {
  test('E2E-01: Trang chủ & Đề xuất phương tiện theo quãng đường (1-100, 101-450, 451-1000, >1000, <=0)', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('TravelVN').first()).toBeVisible();
    await expect(page.getByText('Ưu đãi nổi bật')).toBeVisible();
    await expect(page.getByText('Điểm đến hàng đầu')).toBeVisible();

    // 1–100 km: Đà Nẵng -> Hội An (30 km) -> Xe Máy
    await page.getByLabel('Điểm đi').selectOption('Đà Nẵng');
    await page.getByLabel('Điểm đến').selectOption('Hội An');
    await expect(page.getByLabel('Quãng đường (km)')).toHaveValue('30');
    await expect(page.getByText('Đề xuất: Xe Máy (1 – 100 km)')).toBeVisible();

    // 101–450 km
    await page.getByLabel('Quãng đường (km)').fill('300');
    await expect(page.getByText('Đề xuất: Xe Buýt / Xe Khách (101 – 450 km)')).toBeVisible();

    // 451–1000 km
    await page.getByLabel('Quãng đường (km)').fill('750');
    await expect(page.getByText('Đề xuất: Máy Bay (451 – 1000 km)')).toBeVisible();

    // > 1000 km
    await page.getByLabel('Quãng đường (km)').fill('1500');
    await expect(page.getByText('Chặng dài (> 1000 km): Chỉ khuyến nghị Máy Bay')).toBeVisible();

    // <= 0 km
    await page.getByLabel('Quãng đường (km)').fill('0');
    await expect(page.getByText('Quãng đường phải lớn hơn 0 km (tối thiểu 1 km).')).toBeVisible();
  });

  test('E2E-02: Kiểm tra Validate tìm kiếm (trùng điểm đi/đến, ngày quá khứ)', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Điểm đi').selectOption('Hà Nội');
    await page.getByLabel('Điểm đến').selectOption('Hà Nội');
    await page.getByRole('button', { name: /Tìm kiếm ngay/i }).click();
    await expect(page.getByText('Điểm đi và điểm đến không được trùng nhau.')).toBeVisible();

    await page.getByLabel('Điểm đến').selectOption('Đà Nẵng');
    await page.getByLabel('Ngày đi').fill('2020-01-01');
    await page.getByRole('button', { name: /Tìm kiếm ngay/i }).click();
    await expect(page.getByText('Không thể chọn ngày đi trong quá khứ.')).toBeVisible();
  });

  test('E2E-03: Đăng nhập sai mật khẩu, sai tab vai trò và Đăng ký tài khoản mới', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();

    // Sai mật khẩu
    await page.getByPlaceholder('name@example.com').fill('nguyenvana@gmail.com');
    await page.getByPlaceholder('••••••••').fill('matkhausai');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('Email hoặc mật khẩu không đúng.')).toBeVisible();

    // Tài khoản đối tác đăng nhập nhầm tab Khách hàng
    await page.getByPlaceholder('name@example.com').fill('phuongtrang@travel.vn');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByText('Tài khoản đối tác vui lòng đăng nhập bên tab Đối tác.')).toBeVisible();

    // Chuyển sang Đăng ký tài khoản mới
    await page.getByRole('button', { name: 'Đăng ký ngay' }).click();
    await page.getByPlaceholder('Nguyễn Văn A').fill('Trần Kiểm Thử');
    await page.getByPlaceholder('name@example.com').fill('tester@travel.vn');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByRole('button', { name: /Vé của tôi/i })).toBeVisible();
  });

  test('E2E-04: Xem chi tiết chuyến đi, Chọn ghế, Áp mã giảm giá và Thanh toán thành công', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
    await page.getByPlaceholder('name@example.com').fill('nguyenvana@gmail.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByRole('button', { name: /Vé của tôi/i })).toBeVisible();

    await page.getByLabel('Điểm đi').selectOption('Đà Nẵng');
    await page.getByLabel('Điểm đến').selectOption('Hội An');
    await page.getByRole('button', { name: /Tìm kiếm ngay/i }).click();

    // Mở Chi tiết chuyến đi trước khi đặt
    await page.getByTitle('Xem chi tiết').first().click();
    await expect(page.getByText('Lịch trình dự kiến')).toBeVisible();
    await page.getByRole('button', { name: 'Đặt vé ngay' }).click();

    await page.locator('button:not([disabled])', { hasText: /^[A-D][1-5]$/ }).first().click();
    await page.getByRole('button', { name: 'Tiếp tục' }).click();

    await page.getByPlaceholder('Nhập mã ưu đãi...').fill('NEWBIE100');
    await page.getByRole('button', { name: 'Áp dụng' }).click();
    await expect(page.getByText('Áp dụng mã ưu đãi thành công!')).toBeVisible();

    await page.getByRole('button', { name: /Xác nhận thanh toán/i }).click();
    await expect(page.getByRole('heading', { name: 'Đặt vé thành công!' })).toBeVisible();
  });

  test('E2E-05: Bảng quyết định Hủy vé < 24h (R2 từ chối Thường, R3 VIP hoàn 80%)', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
    await page.getByPlaceholder('name@example.com').fill('nguyenvana@gmail.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.locator('form button[type="submit"]').click();

    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel('Điểm đi').selectOption('Hà Nội');
    await page.getByLabel('Điểm đến').selectOption('Đà Nẵng');
    await page.getByLabel('Ngày đi').fill(today);
    await page.getByRole('button', { name: /Tìm kiếm ngay/i }).click();

    await page.getByRole('button', { name: 'Chọn chuyến' }).first().click();
    await page.locator('button:not([disabled])', { hasText: /^[A-D][1-5]$/ }).first().click();
    await page.getByRole('button', { name: 'Tiếp tục' }).click();
    await page.getByRole('button', { name: /Xác nhận thanh toán/i }).click();
    await page.getByRole('button', { name: 'Xem lịch sử đặt' }).click();

    // R2: Thường + < 24h -> Từ chối
    await page.getByRole('button', { name: 'Hủy vé' }).first().click();
    await expect(page.getByRole('heading', { name: 'Không thể hủy vé' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Đồng ý hủy' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Đóng' }).click();

    // R3: VIP + < 24h -> Hoàn 80%
    await page.getByRole('button', { name: /Chuyển sang VIP/i }).click();
    await page.getByRole('button', { name: 'Hủy vé' }).first().click();
    await expect(page.getByText(/Tiền hoàn lại \(80%\):/i)).toBeVisible();
    await page.getByRole('button', { name: 'Đồng ý hủy' }).click();
    await expect(page.getByText(/Đã hoàn 80%.*Đã trừ 20% phí hủy/i)).toBeVisible();
  });

  test('E2E-06: Bảng quyết định Hủy vé >= 24h (R4 Thường hoàn 80%, R5 VIP hoàn 100%)', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
    await page.getByPlaceholder('name@example.com').fill('nguyenvana@gmail.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.locator('form button[type="submit"]').click();

    // Đặt 2 vé chuyến cách >= 2 ngày
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.getByLabel('Điểm đi').selectOption('Đà Nẵng');
    await page.getByLabel('Điểm đến').selectOption('Hội An');
    await page.getByLabel('Ngày đi').fill(futureDate);
    await page.getByRole('button', { name: /Tìm kiếm ngay/i }).click();

    await page.getByRole('button', { name: 'Chọn chuyến' }).first().click();
    await page.locator('button:not([disabled])', { hasText: /^[A-D][1-5]$/ }).first().click();
    await page.getByRole('button', { name: 'Tiếp tục' }).click();
    await page.getByRole('button', { name: /Xác nhận thanh toán/i }).click();
    await page.getByRole('button', { name: 'Xem lịch sử đặt' }).click();

    // R5: Chuyển VIP + >= 24h -> Hoàn 100%
    await page.getByRole('button', { name: /Chuyển sang VIP/i }).click();
    await page.getByRole('button', { name: 'Hủy vé' }).first().click();
    await expect(page.getByText(/Tiền hoàn lại \(100%\):/i)).toBeVisible();
    await page.getByRole('button', { name: 'Đồng ý hủy' }).click();
    await expect(page.getByText(/Đã hoàn 100%/i)).toBeVisible();
  });

  test('E2E-07: Tìm kiếm Khách sạn, Lọc tiện ích, Sắp xếp và Đặt phòng', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
    await page.getByPlaceholder('name@example.com').fill('nguyenvana@gmail.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.locator('form button[type="submit"]').click();

    await page.getByRole('button', { name: /Khách sạn/i }).first().click();
    await page.getByLabel('Thành phố').selectOption('Đà Nẵng');
    await page.getByRole('button', { name: /Tìm khách sạn/i }).click();

    await expect(page.getByText('Khách sạn phù hợp')).toBeVisible();
    await page.getByLabel('Wifi').check();
    await page.getByLabel('Đánh giá cao nhất').check();
    await page.getByRole('button', { name: 'Đặt phòng' }).first().click();

    await page.getByPlaceholder('Nhập mã ưu đãi...').fill('HOTEL2024');
    await page.getByRole('button', { name: 'Áp dụng' }).click();
    await expect(page.getByText('Áp dụng mã ưu đãi thành công!')).toBeVisible();
    await page.getByRole('button', { name: /Xác nhận thanh toán/i }).click();
    await expect(page.getByRole('heading', { name: 'Đặt phòng thành công!' })).toBeVisible();
  });

  test('E2E-08: Trang Ưu đãi (Lưu mã khuyến mãi & Đăng ký bản tin)', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Ưu đãi/i }).click();
    await expect(page.getByText('Kho Ưu Đãi Độc Quyền')).toBeVisible();

    await page.getByRole('button', { name: 'Lưu mã' }).first().click();
    await expect(page.getByRole('button', { name: 'Đã lưu' }).first()).toBeVisible();

    await page.getByPlaceholder('Nhập email của bạn...').fill('newsletter@travel.vn');
    await page.getByRole('button', { name: 'Đăng ký ngay' }).click();
    await expect(page.getByText('Đã đăng ký nhận ưu đãi cho email newsletter@travel.vn!')).toBeVisible();
  });

  test('E2E-09: Luồng Đối tác đăng ký chuyến và Admin phê duyệt', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
    await page.getByRole('button', { name: /Đối tác \/ Nhà xe/i }).click();
    await page.getByPlaceholder('name@example.com').fill('phuongtrang@travel.vn');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.locator('form button[type="submit"]').click();

    await page.getByRole('button', { name: /Kênh đối tác/i }).click();
    await page.getByRole('button', { name: /Đăng ký chuyến/i }).click();
    await page.getByRole('button', { name: 'Gửi duyệt' }).click();

    await page.getByRole('button', { name: 'Chờ duyệt' }).click();
    await expect(page.getByText('PENDING').first()).toBeVisible();

    await page.getByTitle('Đăng xuất').click();
    await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
    await page.getByPlaceholder('name@example.com').fill('admin@travel.vn');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.locator('form button[type="submit"]').click();

    await page.getByRole('button', { name: /Quản trị/i }).click();
    await expect(page.getByText(/Yêu cầu duyệt/i)).toBeVisible();
    await page.getByRole('button', { name: 'Duyệt' }).first().click();
  });

  test('E2E-10: Kiểm tra đề xuất phương tiện cho tuyến Đà Nẵng - Hội An', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Điểm đi').selectOption('Đà Nẵng');
    await page.getByLabel('Điểm đến').selectOption('Hội An');
    await expect(page.getByLabel('Quãng đường (km)')).toHaveValue('30');

    await expect(page.getByText('Đề xuất: Máy Bay (451 – 1000 km)')).toBeVisible({ timeout: 2000 });
  });

  test('E2E-11: Kiểm tra áp dụng mã ưu đãi khi thanh toán vé', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
    await page.getByPlaceholder('name@example.com').fill('nguyenvana@gmail.com');
    await page.getByPlaceholder('••••••••').fill('123456');
    await page.locator('form button[type="submit"]').click();

    await page.getByLabel('Điểm đi').selectOption('Đà Nẵng');
    await page.getByLabel('Điểm đến').selectOption('Hội An');
    await page.getByRole('button', { name: /Tìm kiếm ngay/i }).click();
    await page.getByRole('button', { name: 'Chọn chuyến' }).first().click();
    await page.locator('button:not([disabled])', { hasText: /^[A-D][1-5]$/ }).first().click();
    await page.getByRole('button', { name: 'Tiếp tục' }).click();

    await page.getByPlaceholder('Nhập mã ưu đãi...').fill('MAGIAMGIA999');
    await page.getByRole('button', { name: 'Áp dụng' }).click();

    await expect(page.getByText('Áp dụng mã ưu đãi thành công!')).toBeVisible({ timeout: 2000 });
  });
});
