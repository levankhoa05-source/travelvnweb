import React, { useState } from 'react';
import { Users, Bus, Ticket as TicketIcon, CheckCircle, XCircle, Ban, Trash2, Clock, MapPin, DollarSign, TrendingUp, Briefcase, Plus, ShieldCheck } from 'lucide-react';
import { Trip, Ticket, User, VehicleType } from '../types';
import { CITIES, getRouteDistance } from '../lib/mockData';

export const AdminDashboard: React.FC<{
  tickets: Ticket[];
  trips: Trip[];
  partners?: User[];
  onApproveTrip: (id: string) => void;
  onRejectTrip: (id: string) => void;
  onBanPartner?: (id: string, days: number | null) => void;
  onUnbanPartner?: (id: string) => void;
}> = ({ tickets, trips, partners = [], onApproveTrip, onRejectTrip, onBanPartner, onUnbanPartner }) => {
  const bookedTickets = tickets.filter((t) => t.status === 'BOOKED');
  const totalRev = bookedTickets.reduce(
    (a, t) => a + (t.totalPrice ?? t.tripDetails?.price ?? t.hotelDetails?.pricePerNight ?? 0),
    0
  );
  const activeTrips = trips.filter((t) => t.status === 'APPROVED').length;
  const pendingTrips = trips.filter((t) => t.status === 'PENDING');

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hệ thống quản trị</h2>
          <span className="text-sm text-slate-500">Xin chào, Admin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Doanh Thu" value={`${totalRev.toLocaleString()} đ`} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="Vé Bán" value={bookedTickets.length} icon={TicketIcon} color="bg-blue-500" />
        <StatCard title="Đã Duyệt" value={activeTrips} icon={TrendingUp} color="bg-indigo-500" />
        <StatCard title="Chờ Duyệt" value={pendingTrips.length} icon={Clock} color="bg-yellow-500" />
      </div>

      {pendingTrips.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden">
          <div className="p-4 bg-yellow-50 font-bold text-yellow-800">
            Yêu cầu duyệt ({pendingTrips.length})
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b">
              <tr>
                <th className="p-4">Hành trình</th>
                <th className="p-4">Phương tiện</th>
                <th className="p-4">Ngày / Giờ</th>
                <th className="p-4">Giá vé</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pendingTrips.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-4 font-medium">
                    {t.from} → {t.to}
                  </td>
                  <td className="p-4">{t.vehicleType}</td>
                  <td className="p-4">{t.date} {t.time}</td>
                  <td className="p-4">{t.price.toLocaleString()} đ</td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button
                      onClick={() => onApproveTrip(t.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded inline-flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" /> Duyệt
                    </button>
                    <button
                      onClick={() => onRejectTrip(t.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded inline-flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Từ chối
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {partners.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 font-bold text-slate-800 border-b">
            Quản lý Đối tác ({partners.length})
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b">
              <tr>
                <th className="p-4">Tên đối tác</th>
                <th className="p-4">Email</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-slate-500">{p.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.status === 'BANNED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {p.status === 'BANNED' ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {p.status === 'BANNED' ? (
                      <button
                        onClick={() => onUnbanPartner?.(p.id)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1 rounded inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Mở khóa
                      </button>
                    ) : (
                      <button
                        onClick={() => onBanPartner?.(p.id, 7)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded inline-flex items-center gap-1 text-xs font-bold"
                      >
                        <Ban className="w-3.5 h-3.5" /> Khóa 7 ngày
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const PartnerDashboard: React.FC<{
  partner: User;
  trips: Trip[];
  tickets: Ticket[];
  onAddTrip: (tripData: any) => void;
  onDeleteTrip: (id: string) => void;
}> = ({ partner, trips, tickets, onAddTrip, onDeleteTrip }) => {
  const [tab, setTab] = useState<'active' | 'pending' | 'customers'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const isAirline = partner?.id === 'partner-3' || partner?.id === 'partner-4';
  const [form, setForm] = useState({
    from: 'Hà Nội',
    to: 'Đà Nẵng',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    price: 250000,
    vehicleType: isAirline ? VehicleType.PLANE : VehicleType.BUS,
    totalSeats: isAirline ? 150 : 40,
    duration: '5h 00m',
    plateNumber: '',
    driverName: '',
    driverPhone: '',
    driverId: '',
    vehicleDoc: ''
  });

  const partnerTrips = trips.filter((t) => !t.partnerId || t.partnerId === partner?.id);
  const partnerTripIds = new Set(partnerTrips.map((t) => t.id));
  const partnerTickets = tickets.filter(
    (t) => t.status === 'BOOKED' && (!t.tripId || partnerTripIds.has(t.tripId))
  );
  const rev = partnerTickets.reduce((a, t) => a + (t.totalPrice ?? t.tripDetails?.price ?? 0), 0);
  const activeTrips = partnerTrips.filter((t) => t.status === 'APPROVED');
  const pendingTrips = partnerTrips.filter((t) => t.status === 'PENDING');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (form.from === form.to) {
      setFormError('Điểm đi và điểm đến không được trùng nhau.');
      return;
    }
    if (form.price <= 0) {
      setFormError('Giá vé phải lớn hơn 0.');
      return;
    }
    if (form.totalSeats <= 0) {
      setFormError('Số ghế phải lớn hơn 0.');
      return;
    }

    onAddTrip({
      ...form,
      distance: getRouteDistance(form.from, form.to),
      transportDetails: {
        plateNumber: form.plateNumber || '29B-999.99',
        driverName: form.driverName || 'Tài xế đối tác',
        driverPhone: form.driverPhone,
        driverId: form.driverId,
        vehicleDoc: form.vehicleDoc
      }
    });
    setIsModalOpen(false);
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="text-blue-600" /> Kênh Đối Tác - {partner?.name}
          </h2>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition"
        >
          <Plus className="h-5 w-5" /> Đăng ký chuyến
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Doanh thu" value={`${rev.toLocaleString()} đ`} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="Vé đã bán" value={partnerTickets.length} icon={Users} color="bg-blue-500" />
        <StatCard title="Đang chạy" value={activeTrips.length} icon={Bus} color="bg-orange-500" />
        <StatCard title="Chờ duyệt" value={pendingTrips.length} icon={Clock} color="bg-yellow-500" />
      </div>

      <div className="flex gap-4 border-b">
        {(['active', 'pending', 'customers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-1 font-bold ${
              tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'
            }`}
          >
            {t === 'active' ? 'Đang hoạt động' : t === 'pending' ? 'Chờ duyệt' : 'Khách hàng'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {tab === 'customers' ? (
                <>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Chuyến đi</th>
                  <th className="p-4">Ghế</th>
                  <th className="p-4">Trạng thái</th>
                </>
              ) : (
                <>
                  <th className="p-4">Hành trình</th>
                  <th className="p-4">Phương tiện</th>
                  <th className="p-4">Ngày / Giờ</th>
                  <th className="p-4">Giá vé</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Thao tác</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {tab === 'customers' ? (
              partnerTickets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    Chưa có khách hàng đặt vé.
                  </td>
                </tr>
              ) : (
                partnerTickets.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-4">{t.userDetails?.name || 'Khách hàng'}</td>
                    <td className="p-4">
                      {t.tripDetails?.from} → {t.tripDetails?.to}
                    </td>
                    <td className="p-4">{t.seatNumber || '-'}</td>
                    <td className="p-4">{t.status}</td>
                  </tr>
                ))
              )
            ) : (tab === 'active' ? activeTrips : pendingTrips).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  Không có chuyến đi nào trong mục này.
                </td>
              </tr>
            ) : (
              (tab === 'active' ? activeTrips : pendingTrips).map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="p-4">
                    <MapPin className="inline w-4 h-4 mr-1 text-blue-500" />
                    {t.from} → {t.to}
                  </td>
                  <td className="p-4">{t.vehicleType}</td>
                  <td className="p-4">
                    {t.date} {t.time}
                  </td>
                  <td className="p-4">{t.price.toLocaleString()} đ</td>
                  <td className="p-4">{t.status}</td>
                  <td className="p-4">
                    <button onClick={() => onDeleteTrip(t.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Đăng ký chuyến đi mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Điểm đi</label>
                  <select
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                    className="border p-2 rounded w-full"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Điểm đến</label>
                  <select
                    value={form.to}
                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                    className="border p-2 rounded w-full"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Ngày đi</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Giờ xuất phát</label>
                  <input
                    required
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Loại phương tiện</label>
                  <select
                    value={form.vehicleType}
                    onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
                    className="border p-2 rounded w-full"
                  >
                    <option value={VehicleType.MOTORBIKE}>{VehicleType.MOTORBIKE}</option>
                    <option value={VehicleType.BUS}>{VehicleType.BUS}</option>
                    <option value={VehicleType.COACH}>{VehicleType.COACH}</option>
                    <option value={VehicleType.PLANE}>{VehicleType.PLANE}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Giá vé (đ)</label>
                  <input
                    required
                    type="number"
                    min={1000}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: +e.target.value })}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tổng số chỗ</label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={200}
                    value={form.totalSeats}
                    onChange={(e) => setForm({ ...form, totalSeats: +e.target.value })}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Thời gian dự kiến</label>
                  <input
                    required
                    placeholder="VD: 5h 30m"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {formError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 rounded font-medium"
                >
                  Hủy
                </button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">
                  Gửi duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
