import React, { useState } from 'react';
import { LayoutDashboard, Users, Bus, Ticket as TicketIcon, CheckCircle, XCircle, Ban, Search, Plus, Trash2, Edit, Calendar, Clock, MapPin, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { Trip, Ticket, User, UserRole, VehicleType } from '../types';

export const AdminDashboard: React.FC<any> = ({ tickets, trips, onApproveTrip, onRejectTrip }) => {
  const bookedTickets = tickets.filter((t: any) => t.status === 'BOOKED');
  const totalRev = bookedTickets.reduce((a: number, t: any) => a + (t.tripDetails?.price || 0), 0);
  const activeTrips = trips.filter((t: any) => t.status === 'APPROVED').length;
  const pendingTrips = trips.filter((t: any) => t.status === 'PENDING');
  
  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
      <div><p className="text-sm text-slate-500">{title}</p><p className="text-2xl font-bold">{value}</p></div>
      <div className={`p-3 rounded-full ${color}`}><Icon className="h-6 w-6 text-white" /></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold">Hệ thống quản trị</h2><span className="text-sm text-slate-500">Xin chào, Admin</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Doanh Thu" value={`${totalRev.toLocaleString()} đ`} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="Vé Bán" value={bookedTickets.length} icon={TicketIcon} color="bg-blue-500" />
        <StatCard title="Đã Duyệt" value={activeTrips} icon={TrendingUp} color="bg-indigo-500" />
        <StatCard title="Chờ Duyệt" value={pendingTrips.length} icon={Clock} color="bg-yellow-500" />
      </div>

      {pendingTrips.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden">
          <div className="p-4 bg-yellow-50 font-bold text-yellow-800">Yêu cầu duyệt ({pendingTrips.length})</div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b"><tr><th className="p-4">Hành trình</th><th className="p-4">Phương tiện</th><th className="p-4 text-center">Hành động</th></tr></thead>
            <tbody>
              {pendingTrips.map((t: any) => (
                <tr key={t.id} className="border-b">
                  <td className="p-4">{t.from} → {t.to}</td>
                  <td className="p-4">{t.vehicleType}</td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <button onClick={() => onApproveTrip(t.id)} className="bg-green-100 text-green-700 px-3 py-1 rounded">Duyệt</button>
                    <button onClick={() => onRejectTrip(t.id)} className="bg-red-100 text-red-700 px-3 py-1 rounded">Từ chối</button>
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

export const PartnerDashboard: React.FC<any> = ({ user, trips, tickets, onAddTrip, onDeleteTrip }) => {
  const [tab, setTab] = useState<'active' | 'pending' | 'customers'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAirline = user?.id === 'partner-2';
  const [form, setForm] = useState({ from: 'Hà Nội', to: 'Đà Nẵng', date: '', time: '08:00', price: 200000, vehicleType: isAirline ? VehicleType.PLANE : VehicleType.BUS, totalSeats: 40, duration: '5h', plateNumber: '', driverName: '', driverPhone: '', driverId: '', vehicleDoc: '' });

  const partnerTickets = tickets.filter((t: any) => t.status === 'BOOKED');
  const rev = partnerTickets.reduce((a: number, t: any) => a + (t.tripDetails?.price || 0), 0);
  const activeTrips = trips.filter((t: any) => t.status === 'APPROVED');
  const pendingTrips = trips.filter((t: any) => t.status === 'PENDING');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTrip({ ...form, transportDetails: { plateNumber: form.plateNumber, driverName: form.driverName, driverPhone: form.driverPhone, driverId: form.driverId, vehicleDoc: form.vehicleDoc } });
    setIsModalOpen(false);
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
      <div><p className="text-sm text-slate-500">{title}</p><p className="text-2xl font-bold">{value}</p></div>
      <div className={`p-3 rounded-full ${color}`}><Icon className="h-6 w-6 text-white" /></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="text-blue-600"/> Kênh Đối Tác</h2></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"><Plus className="h-5 w-5"/> Đăng ký chuyến</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Doanh thu" value={`${rev.toLocaleString()} đ`} icon={DollarSign} color="bg-emerald-500" />
        <StatCard title="Vé đã bán" value={partnerTickets.length} icon={Users} color="bg-blue-500" />
        <StatCard title="Đang chạy" value={activeTrips.length} icon={Bus} color="bg-orange-500" />
        <StatCard title="Chờ duyệt" value={pendingTrips.length} icon={Clock} color="bg-yellow-500" />
      </div>

      <div className="flex gap-4 border-b">
        {['active', 'pending', 'customers'].map(t => (
          <button key={t} onClick={() => setTab(t as any)} className={`pb-2 px-1 font-bold ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}>
            {t === 'active' ? 'Đang hoạt động' : t === 'pending' ? 'Chờ duyệt' : 'Khách hàng'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {tab === 'customers' ? (
                <><th className="p-4">Khách hàng</th><th className="p-4">Chuyến đi</th><th className="p-4">Trạng thái</th></>
              ) : (
                <><th className="p-4">Hành trình</th><th className="p-4">Phương tiện</th><th className="p-4">Trạng thái</th><th className="p-4">Thao tác</th></>
              )}
            </tr>
          </thead>
          <tbody>
            {tab === 'customers' ? tickets.map((t: any) => (
              <tr key={t.id} className="border-b"><td className="p-4">{t.userDetails?.name}</td><td className="p-4">{t.tripDetails?.from} → {t.tripDetails?.to}</td><td className="p-4">{t.status}</td></tr>
            )) : (tab === 'active' ? activeTrips : pendingTrips).map((t: any) => (
              <tr key={t.id} className="border-b">
                <td className="p-4"><MapPin className="inline w-4 h-4"/> {t.from} → {t.to}</td>
                <td className="p-4">{t.vehicleType}</td>
                <td className="p-4">{t.status}</td>
                <td className="p-4"><button onClick={() => onDeleteTrip(t.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Đăng ký chuyến đi mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Điểm đi" value={form.from} onChange={e => setForm({...form, from: e.target.value})} className="border p-2 rounded" />
                <input required placeholder="Điểm đến" value={form.to} onChange={e => setForm({...form, to: e.target.value})} className="border p-2 rounded" />
                <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="border p-2 rounded" />
                <input required type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="border p-2 rounded" />
                <input required type="number" placeholder="Giá" value={form.price} onChange={e => setForm({...form, price: +e.target.value})} className="border p-2 rounded" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded">Gửi duyệt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
