import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTrips, generateHotels } from './lib/mockData.ts';
import { UserRole } from './types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Database connection pool
  let pool: mysql.Pool | null = null;
  
  // Only attempt to connect if DB_HOST is provided (e.g., when running locally)
  if (process.env.DB_HOST) {
    try {
      const tempPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'travel_app',
        port: Number(process.env.DB_PORT) || 3306,
        connectTimeout: 1500,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      
      // Test the connection
      const connection = await tempPool.getConnection();
      connection.release();
      
      pool = tempPool;
      console.log('Đã khởi tạo kết nối Database (MySQL).');

      // Initialize Database (Create tables and seed data if empty)
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('USER', 'PARTNER', 'ADMIN') DEFAULT 'USER',
            status ENUM('ACTIVE', 'BANNED') DEFAULT 'ACTIVE',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await pool.query(`
          CREATE TABLE IF NOT EXISTS trips (
            id VARCHAR(50) PRIMARY KEY,
            partnerId VARCHAR(50) NOT NULL,
            vehicleType VARCHAR(50) NOT NULL,
            departureLocation VARCHAR(100) NOT NULL,
            arrivalLocation VARCHAR(100) NOT NULL,
            departureTime DATETIME NOT NULL,
            arrivalTime DATETIME NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            totalSeats INT NOT NULL,
            availableSeats INT NOT NULL,
            status ENUM('APPROVED', 'PENDING', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
            amenities JSON,
            stops JSON,
            FOREIGN KEY (partnerId) REFERENCES users(id)
          )
        `);
        await pool.query(`
          CREATE TABLE IF NOT EXISTS hotels (
            id VARCHAR(50) PRIMARY KEY,
            partnerId VARCHAR(50) NOT NULL,
            name VARCHAR(100) NOT NULL,
            address TEXT NOT NULL,
            pricePerNight DECIMAL(10, 2) NOT NULL,
            rating DECIMAL(3, 1) DEFAULT 0,
            image TEXT,
            amenities JSON,
            availableRooms INT NOT NULL,
            distance DECIMAL(10, 2),
            FOREIGN KEY (partnerId) REFERENCES users(id)
          )
        `);
        await pool.query(`
          CREATE TABLE IF NOT EXISTS vouchers (
            id VARCHAR(50) PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            discountPercent DECIMAL(5, 2) NOT NULL,
            maxDiscount DECIMAL(10, 2) NOT NULL,
            expiryDate DATETIME NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await pool.query(`
          CREATE TABLE IF NOT EXISTS tickets (
            id VARCHAR(50) PRIMARY KEY,
            userId VARCHAR(50) NOT NULL,
            tripId VARCHAR(50) NULL,
            hotelId VARCHAR(50) NULL,
            voucherId VARCHAR(50) NULL,
            seatNumber VARCHAR(20),
            roomType VARCHAR(50),
            bookingDate DATETIME DEFAULT CURRENT_TIMESTAMP,
            totalPrice DECIMAL(10, 2) NOT NULL,
            status ENUM('BOOKED', 'PAID', 'CANCELLED') DEFAULT 'BOOKED',
            cancelReason TEXT,
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (tripId) REFERENCES trips(id),
            FOREIGN KEY (hotelId) REFERENCES hotels(id),
            FOREIGN KEY (voucherId) REFERENCES vouchers(id)
          )
        `);

        // Check if users exist
        const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM users');
        if (rows[0].count === 0) {
          console.log('Database trống. Đang thêm dữ liệu mẫu...');
          
          await pool.query(`
            INSERT INTO users (id, name, email, password, role, status) VALUES
            ('u1', 'Admin System', 'admin@travel.vn', '123456', 'ADMIN', 'ACTIVE'),
            ('p1', 'Nhà xe Phương Trang', 'phuongtrang@travel.vn', '123456', 'PARTNER', 'ACTIVE'),
            ('u2', 'Nguyễn Văn A', 'nguyenvana@gmail.com', '123456', 'USER', 'ACTIVE')
          `);

          await pool.query(`
            INSERT INTO trips (id, partnerId, vehicleType, departureLocation, arrivalLocation, departureTime, arrivalTime, price, totalSeats, availableSeats, status, amenities, stops) VALUES
            ('t1', 'p1', 'Xe Khách', 'Hà Nội', 'Sapa', '2026-04-10 07:00:00', '2026-04-10 13:00:00', 250000, 40, 40, 'APPROVED', '["Wifi", "Nước uống"]', '[]'),
            ('t2', 'p1', 'Máy Bay', 'Hà Nội', 'Đà Nẵng', '2026-04-12 09:00:00', '2026-04-12 10:30:00', 1200000, 150, 150, 'APPROVED', '["Hành lý 20kg", "Suất ăn"]', '[]'),
            ('t3', 'p1', 'Bus Giường Nằm', 'Hồ Chí Minh', 'Đà Lạt', '2026-04-15 22:00:00', '2026-04-16 05:00:00', 350000, 34, 34, 'APPROVED', '["Wifi", "Chăn ấm", "Nước uống"]', '[]')
          `);

          await pool.query(`
            INSERT INTO hotels (id, partnerId, name, address, pricePerNight, rating, image, amenities, availableRooms, distance) VALUES
            ('h1', 'p1', 'Sapa Horizon Hotel', '097 Phạm Xuân Huân, Sapa', 850000, 4.5, 'https://picsum.photos/seed/sapa/800/600', '["Wifi", "Bữa sáng", "Hồ bơi"]', 20, 0.5),
            ('h2', 'p1', 'Da Nang Beach Resort', '123 Võ Nguyên Giáp, Đà Nẵng', 1500000, 4.8, 'https://picsum.photos/seed/danang/800/600', '["Wifi", "Bãi biển riêng", "Spa"]', 50, 2.0)
          `);

          await pool.query(`
            INSERT INTO vouchers (id, code, discountPercent, maxDiscount, expiryDate) VALUES
            ('v1', 'TRAVEL2026', 10.00, 500000.00, '2026-12-31 23:59:59'),
            ('v2', 'NEWBIE100', 20.00, 100000.00, '2026-12-31 23:59:59'),
            ('v3', 'FLY20', 20.00, 500000.00, '2026-12-31 23:59:59')
          `);

          console.log('Thêm dữ liệu mẫu thành công!');
        } else {
          console.log('Database đã có dữ liệu, bỏ qua bước thêm dữ liệu mẫu.');
        }
      } catch (dbError) {
        console.error('Lỗi khi khởi tạo bảng hoặc thêm dữ liệu mẫu:', dbError);
      }
    } catch (err) {
      console.log('Không thể kết nối Database (MySQL), tự động chuyển sang chế độ Mock Data. Lỗi:', (err as Error).message);
      pool = null;
    }
  } else {
    console.log('Chưa cấu hình DB_HOST. Chạy ở chế độ Mock Data.');
  }

  // In-memory Mock Store (dùng khi chưa có MySQL)
  const mockUsers = [
    { id: 'u1', name: 'Admin System', email: 'admin@travel.vn', password: '123456', role: UserRole.ADMIN, status: 'ACTIVE' },
    { id: 'p1', name: 'Nhà xe Phương Trang', email: 'phuongtrang@travel.vn', password: '123456', role: UserRole.PARTNER, status: 'ACTIVE' },
    { id: 'u2', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', password: '123456', role: UserRole.USER, status: 'ACTIVE' }
  ];
  const mockTrips = generateTrips();
  const mockHotels = generateHotels();
  const mockVouchers = [
    { id: 'v1', code: 'TRAVEL2026', discountPercent: 10, maxDiscount: 500000, expiryDate: '2026-12-31 23:59:59' },
    { id: 'v2', code: 'NEWBIE100', discountPercent: 20, maxDiscount: 100000, expiryDate: '2026-12-31 23:59:59' },
    { id: 'v3', code: 'FLY20', discountPercent: 20, maxDiscount: 500000, expiryDate: '2026-12-31 23:59:59' }
  ];
  const mockTickets: any[] = [];

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', dbConnected: !!pool, mode: pool ? 'mysql' : 'mock' });
  });

  // Auth login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    if (!pool) {
      const matched = mockUsers.find(u => u.email === email && u.password === password);
      if (!matched) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const { password: _pwd, ...safeUser } = matched;
      return res.json(safeUser);
    }

    try {
      const [rows]: any = await pool.query(
        'SELECT id, name, email, role, status FROM users WHERE email = ? AND password = ? LIMIT 1',
        [email, password]
      );

      if (!rows.length) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      return res.json(rows[0]);
    } catch (error) {
      console.error('DB Error:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }
  });

  // Fetch trips
  app.get('/api/trips', async (req, res) => {
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM trips');
        const trips = (rows as any[]).map(row => ({
          ...row,
          price: typeof row.price === 'string' ? Number(row.price) : row.price,
          totalSeats: typeof row.totalSeats === 'string' ? Number(row.totalSeats) : row.totalSeats,
          availableSeats: typeof row.availableSeats === 'string' ? Number(row.availableSeats) : row.availableSeats,
          amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities,
          stops: typeof row.stops === 'string' ? JSON.parse(row.stops) : row.stops,
          from: row.departureLocation,
          to: row.arrivalLocation,
          date: new Date(row.departureTime).toISOString().split('T')[0],
          time: new Date(row.departureTime).toTimeString().substring(0, 5)
        }));
        return res.json(trips);
      } catch (error) {
        console.error('DB Error:', error);
        return res.status(500).json({ error: 'Database query failed' });
      }
    }
    return res.json(mockTrips);
  });

  // Fetch hotels
  app.get('/api/hotels', async (req, res) => {
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM hotels');
        const hotels = (rows as any[]).map(row => ({
          ...row,
          pricePerNight: typeof row.pricePerNight === 'string' ? Number(row.pricePerNight) : row.pricePerNight,
          rating: typeof row.rating === 'string' ? Number(row.rating) : row.rating,
          distance: typeof row.distance === 'string' ? Number(row.distance) : row.distance,
          amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities
        }));
        return res.json(hotels);
      } catch (error) {
        console.error('DB Error:', error);
        return res.status(500).json({ error: 'Database query failed' });
      }
    }
    return res.json(mockHotels);
  });

  // Fetch vouchers
  app.get('/api/vouchers', async (req, res) => {
    if (pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM vouchers');
        return res.json(rows);
      } catch (error) {
        console.error('DB Error:', error);
        return res.status(500).json({ error: 'Database query failed' });
      }
    }
    return res.json(mockVouchers);
  });

  // Fetch tickets
  app.get('/api/tickets', async (req, res) => {
    if (pool) {
      try {
        const [rows] = await pool.query(`
          SELECT
            tk.*,
            u.name AS userName,
            u.email AS userEmail,
            u.role AS userRole,
            tr.departureLocation,
            tr.arrivalLocation,
            tr.departureTime,
            tr.vehicleType,
            tr.price AS tripPrice
          FROM tickets tk
          LEFT JOIN users u ON tk.userId = u.id
          LEFT JOIN trips tr ON tk.tripId = tr.id
          ORDER BY tk.bookingDate DESC
        `);
        const tickets = (rows as any[]).map(row => ({
          ...row,
          totalPrice: typeof row.totalPrice === 'string' ? Number(row.totalPrice) : row.totalPrice,
          userDetails: row.userName
            ? {
                id: row.userId,
                name: row.userName,
                email: row.userEmail,
                role: row.userRole
              }
            : undefined,
          tripDetails: row.tripId
            ? {
                id: row.tripId,
                from: row.departureLocation,
                to: row.arrivalLocation,
                date: row.departureTime ? new Date(row.departureTime).toISOString().split('T')[0] : '',
                time: row.departureTime ? new Date(row.departureTime).toTimeString().substring(0, 5) : '',
                price: typeof row.tripPrice === 'string' ? Number(row.tripPrice) : row.tripPrice,
                vehicleId: '',
                vehicleType: row.vehicleType,
                duration: '',
                availableSeats: 0,
                totalSeats: 0,
                stops: [],
                amenities: [],
                status: 'APPROVED'
              }
            : undefined
        }));
        return res.json(tickets);
      } catch (error) {
        console.error('DB Error:', error);
        return res.status(500).json({ error: 'Database query failed' });
      }
    }
    return res.json(mockTickets);
  });

  // Create ticket
  app.post('/api/tickets', async (req, res) => {
    const { id, userId, tripId, hotelId, voucherId, seatNumber, roomType, totalPrice, status, cancelReason } = req.body || {};
    if (!id || !userId || totalPrice === undefined) {
      return res.status(400).json({ error: 'Missing required ticket fields (id, userId, totalPrice)' });
    }

    if (pool) {
      try {
        await pool.query(
          'INSERT INTO tickets (id, userId, tripId, hotelId, voucherId, seatNumber, roomType, totalPrice, status, cancelReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, userId, tripId || null, hotelId || null, voucherId || null, seatNumber || null, roomType || null, totalPrice, status || 'BOOKED', cancelReason || null]
        );
        return res.status(201).json({ success: true, id });
      } catch (error) {
        console.error('DB Error:', error);
        return res.status(500).json({ error: 'Database query failed' });
      }
    }

    const newTicket = {
      id,
      userId,
      tripId: tripId || null,
      hotelId: hotelId || null,
      voucherId: voucherId || null,
      seatNumber: seatNumber || null,
      roomType: roomType || null,
      totalPrice: Number(totalPrice),
      status: status || 'BOOKED',
      cancelReason: cancelReason || null,
      bookingDate: new Date().toISOString()
    };
    mockTickets.unshift(newTicket);
    return res.status(201).json({ success: true, ticket: newTicket });
  });

  // Update ticket status (e.g., Cancel ticket)
  app.patch('/api/tickets/:id', async (req, res) => {
    const { id } = req.params;
    const { status, cancelReason } = req.body || {};
    if (!status) {
      return res.status(400).json({ error: 'Missing status' });
    }

    if (pool) {
      try {
        const [result]: any = await pool.query(
          'UPDATE tickets SET status = ?, cancelReason = ? WHERE id = ?',
          [status, cancelReason || null, id]
        );
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Ticket not found' });
        }
        return res.json({ success: true, id, status });
      } catch (error) {
        console.error('DB Error:', error);
        return res.status(500).json({ error: 'Database query failed' });
      }
    }

    const idx = mockTickets.findIndex(t => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    mockTickets[idx] = { ...mockTickets[idx], status, cancelReason: cancelReason || null };
    return res.json({ success: true, ticket: mockTickets[idx] });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
