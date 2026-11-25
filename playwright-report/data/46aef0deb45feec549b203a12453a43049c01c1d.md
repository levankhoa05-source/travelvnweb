# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: travelvn.spec.ts >> System / E2E UI Tests - TravelVN >> E2E-11: Kiểm tra áp dụng mã ưu đãi khi thanh toán vé
- Location: tests\e2e\travelvn.spec.ts:240:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Áp dụng mã ưu đãi thành công!')
Expected: visible
Timeout: 2000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Áp dụng mã ưu đãi thành công!') with timeout 2000ms
  - waiting for getByText('Áp dụng mã ưu đãi thành công!')

```

```yaml
- navigation:
  - text: TravelVN
  - button "Trang chủ"
  - button "Ưu đãi"
  - button "Vé của tôi"
  - paragraph: Nguyễn Văn A
  - paragraph: Member
  - text: "N"
  - button "Đăng xuất"
- main:
  - heading "Thanh toán" [level=2]
  - paragraph: Vui lòng kiểm tra thông tin trước khi thanh toán
  - text: Chuyến đi Đà Nẵng - Hội An Số lượng ghế 1 (A1) Tạm tính 105,000 đ Tổng tiền 105,000 đ Mã ưu đãi
  - textbox "Nhập mã ưu đãi...": MAGIAMGIA999
  - button "Áp dụng"
  - paragraph: Mã ưu đãi không hợp lệ hoặc không áp dụng cho dịch vụ này.
  - button "Xác nhận thanh toán (Mô phỏng)"
  - button "Hủy bỏ"
- contentinfo:
  - text: TravelVN
  - paragraph: Nền tảng đặt vé xe, máy bay và khách sạn hàng đầu Việt Nam. Kết nối hàng triệu hành trình mỗi năm.
  - heading "Về chúng tôi" [level=4]
  - list:
    - listitem:
      - link "Giới thiệu":
        - /url: "#"
    - listitem:
      - link "Tuyển dụng":
        - /url: "#"
    - listitem:
      - link "Tin tức":
        - /url: "#"
    - listitem:
      - link "Liên hệ":
        - /url: "#"
  - heading "Hỗ trợ" [level=4]
  - list:
    - listitem:
      - link "Câu hỏi thường gặp":
        - /url: "#"
    - listitem:
      - link "Chính sách bảo mật":
        - /url: "#"
    - listitem:
      - link "Điều khoản sử dụng":
        - /url: "#"
    - listitem:
      - link "Hướng dẫn đặt vé":
        - /url: "#"
  - heading "Kết nối" [level=4]
  - link:
    - /url: "#"
  - link:
    - /url: "#"
  - link:
    - /url: "#"
  - text: support@travelvn.com 1900 123 456 © 2024 TravelVN. All rights reserved.
```

# Test source

```ts
  158 |     await page.getByRole('button', { name: /Chuyển sang VIP/i }).click();
  159 |     await page.getByRole('button', { name: 'Hủy vé' }).first().click();
  160 |     await expect(page.getByText(/Tiền hoàn lại \(100%\):/i)).toBeVisible();
  161 |     await page.getByRole('button', { name: 'Đồng ý hủy' }).click();
  162 |     await expect(page.getByText(/Đã hoàn 100%/i)).toBeVisible();
  163 |   });
  164 | 
  165 |   test('E2E-07: Tìm kiếm Khách sạn, Lọc tiện ích, Sắp xếp và Đặt phòng', async ({ page }) => {
  166 |     await page.goto('/');
  167 | 
  168 |     await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
  169 |     await page.getByPlaceholder('name@example.com').fill('nguyenvana@gmail.com');
  170 |     await page.getByPlaceholder('••••••••').fill('123456');
  171 |     await page.locator('form button[type="submit"]').click();
  172 | 
  173 |     await page.getByRole('button', { name: /Khách sạn/i }).first().click();
  174 |     await page.getByLabel('Thành phố').selectOption('Đà Nẵng');
  175 |     await page.getByRole('button', { name: /Tìm khách sạn/i }).click();
  176 | 
  177 |     await expect(page.getByText('Khách sạn phù hợp')).toBeVisible();
  178 |     await page.getByLabel('Wifi').check();
  179 |     await page.getByLabel('Đánh giá cao nhất').check();
  180 |     await page.getByRole('button', { name: 'Đặt phòng' }).first().click();
  181 | 
  182 |     await page.getByPlaceholder('Nhập mã ưu đãi...').fill('HOTEL2024');
  183 |     await page.getByRole('button', { name: 'Áp dụng' }).click();
  184 |     await expect(page.getByText('Áp dụng mã ưu đãi thành công!')).toBeVisible();
  185 |     await page.getByRole('button', { name: /Xác nhận thanh toán/i }).click();
  186 |     await expect(page.getByRole('heading', { name: 'Đặt phòng thành công!' })).toBeVisible();
  187 |   });
  188 | 
  189 |   test('E2E-08: Trang Ưu đãi (Lưu mã khuyến mãi & Đăng ký bản tin)', async ({ page }) => {
  190 |     await page.goto('/');
  191 | 
  192 |     await page.getByRole('button', { name: /Ưu đãi/i }).click();
  193 |     await expect(page.getByText('Kho Ưu Đãi Độc Quyền')).toBeVisible();
  194 | 
  195 |     await page.getByRole('button', { name: 'Lưu mã' }).first().click();
  196 |     await expect(page.getByRole('button', { name: 'Đã lưu' }).first()).toBeVisible();
  197 | 
  198 |     await page.getByPlaceholder('Nhập email của bạn...').fill('newsletter@travel.vn');
  199 |     await page.getByRole('button', { name: 'Đăng ký ngay' }).click();
  200 |     await expect(page.getByText('Đã đăng ký nhận ưu đãi cho email newsletter@travel.vn!')).toBeVisible();
  201 |   });
  202 | 
  203 |   test('E2E-09: Luồng Đối tác đăng ký chuyến và Admin phê duyệt', async ({ page }) => {
  204 |     await page.goto('/');
  205 | 
  206 |     await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
  207 |     await page.getByRole('button', { name: /Đối tác \/ Nhà xe/i }).click();
  208 |     await page.getByPlaceholder('name@example.com').fill('phuongtrang@travel.vn');
  209 |     await page.getByPlaceholder('••••••••').fill('123456');
  210 |     await page.locator('form button[type="submit"]').click();
  211 | 
  212 |     await page.getByRole('button', { name: /Kênh đối tác/i }).click();
  213 |     await page.getByRole('button', { name: /Đăng ký chuyến/i }).click();
  214 |     await page.getByRole('button', { name: 'Gửi duyệt' }).click();
  215 | 
  216 |     await page.getByRole('button', { name: 'Chờ duyệt' }).click();
  217 |     await expect(page.getByText('PENDING').first()).toBeVisible();
  218 | 
  219 |     await page.getByTitle('Đăng xuất').click();
  220 |     await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
  221 |     await page.getByPlaceholder('name@example.com').fill('admin@travel.vn');
  222 |     await page.getByPlaceholder('••••••••').fill('123456');
  223 |     await page.locator('form button[type="submit"]').click();
  224 | 
  225 |     await page.getByRole('button', { name: /Quản trị/i }).click();
  226 |     await expect(page.getByText(/Yêu cầu duyệt/i)).toBeVisible();
  227 |     await page.getByRole('button', { name: 'Duyệt' }).first().click();
  228 |   });
  229 | 
  230 |   test('E2E-10: Kiểm tra đề xuất phương tiện cho tuyến Đà Nẵng - Hội An', async ({ page }) => {
  231 |     await page.goto('/');
  232 | 
  233 |     await page.getByLabel('Điểm đi').selectOption('Đà Nẵng');
  234 |     await page.getByLabel('Điểm đến').selectOption('Hội An');
  235 |     await expect(page.getByLabel('Quãng đường (km)')).toHaveValue('30');
  236 | 
  237 |     await expect(page.getByText('Đề xuất: Máy Bay (451 – 1000 km)')).toBeVisible({ timeout: 2000 });
  238 |   });
  239 | 
  240 |   test('E2E-11: Kiểm tra áp dụng mã ưu đãi khi thanh toán vé', async ({ page }) => {
  241 |     await page.goto('/');
  242 | 
  243 |     await page.getByRole('button', { name: 'Đăng Nhập', exact: true }).click();
  244 |     await page.getByPlaceholder('name@example.com').fill('nguyenvana@gmail.com');
  245 |     await page.getByPlaceholder('••••••••').fill('123456');
  246 |     await page.locator('form button[type="submit"]').click();
  247 | 
  248 |     await page.getByLabel('Điểm đi').selectOption('Đà Nẵng');
  249 |     await page.getByLabel('Điểm đến').selectOption('Hội An');
  250 |     await page.getByRole('button', { name: /Tìm kiếm ngay/i }).click();
  251 |     await page.getByRole('button', { name: 'Chọn chuyến' }).first().click();
  252 |     await page.locator('button:not([disabled])', { hasText: /^[A-D][1-5]$/ }).first().click();
  253 |     await page.getByRole('button', { name: 'Tiếp tục' }).click();
  254 | 
  255 |     await page.getByPlaceholder('Nhập mã ưu đãi...').fill('MAGIAMGIA999');
  256 |     await page.getByRole('button', { name: 'Áp dụng' }).click();
  257 | 
> 258 |     await expect(page.getByText('Áp dụng mã ưu đãi thành công!')).toBeVisible({ timeout: 2000 });
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
  259 |   });
  260 | });
  261 | 
```