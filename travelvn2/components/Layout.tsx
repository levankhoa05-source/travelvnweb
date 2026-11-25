import React, { useEffect } from 'react';
import { Bus, TicketPercent, LayoutDashboard, Briefcase, History, LogOut, User as UserIcon, Facebook, Instagram, Twitter, Mail, Phone, MapPin, CheckCircle, X, Info, AlertCircle } from 'lucide-react';
import { User, UserRole, AppView } from '../types';

export const Navbar = ({ 
  user, 
  onLogout, 
  onLoginClick,
  currentView,
  setView 
}: { 
  user: User | null, 
  onLogout: () => void, 
  onLoginClick: () => void,
  currentView: AppView,
  setView: (v: AppView) => void
}) => (
  <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center cursor-pointer group" onClick={() => setView('home')}>
          <div className="bg-blue-600 p-2 rounded-lg mr-2 group-hover:bg-blue-700 transition">
            <Bus className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">TravelVN</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => setView('home')} 
            className={`text-sm font-medium transition ${currentView === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Trang chủ
          </button>
          
          <button 
            onClick={() => setView('promotions')} 
            className={`text-sm font-medium flex items-center gap-1 transition ${currentView === 'promotions' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <TicketPercent className="h-4 w-4" /> Ưu đãi
          </button>

          {user ? (
            <>
              {user.role === UserRole.ADMIN ? (
                 <button 
                   onClick={() => setView('admin')} 
                   className={`text-sm font-medium flex items-center gap-1 transition ${currentView === 'admin' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                 >
                   <LayoutDashboard className="h-4 w-4" /> Quản trị
                 </button>
              ) : user.role === UserRole.PARTNER ? (
                 <button 
                   onClick={() => setView('partner')} 
                   className={`text-sm font-medium flex items-center gap-1 transition ${currentView === 'partner' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                 >
                   <Briefcase className="h-4 w-4" /> Kênh đối tác
                 </button>
              ) : (
                <button 
                  onClick={() => setView('history')} 
                  className={`text-sm font-medium flex items-center gap-1 transition ${currentView === 'history' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <History className="h-4 w-4" /> Vé của tôi
                </button>
              )}
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    {user.role === UserRole.ADMIN ? 'Administrator' : user.role === UserRole.PARTNER ? 'Partner' : 'Member'}
                  </p>
                </div>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold border ${
                  user.role === UserRole.PARTNER 
                    ? 'bg-purple-100 text-purple-600 border-purple-200' 
                    : 'bg-blue-100 text-blue-600 border-blue-200'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  title="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center gap-2"
            >
              <UserIcon className="h-4 w-4" />
              Đăng Nhập
            </button>
          )}
        </div>
      </div>
    </div>
  </nav>
);

export const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-blue-600 p-1.5 rounded-md">
                <Bus className="h-5 w-5 text-white" />
             </div>
             <span className="font-bold text-xl text-white">TravelVN</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Nền tảng đặt vé xe, máy bay và khách sạn hàng đầu Việt Nam. Kết nối hàng triệu hành trình mỗi năm.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Về chúng tôi</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Giới thiệu</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Tuyển dụng</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Tin tức</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Liên hệ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Câu hỏi thường gặp</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Điều khoản sử dụng</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Hướng dẫn đặt vé</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">Kết nối</h4>
          <div className="flex gap-4 mb-4">
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 transition"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-pink-600 transition"><Instagram className="h-5 w-5" /></a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-sky-500 transition"><Twitter className="h-5 w-5" /></a>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@travelvn.com</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1900 123 456</div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
        &copy; 2024 TravelVN. All rights reserved.
      </div>
    </div>
  </footer>
);

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${getBgColor()}`}>
        {getIcon()}
        <p className="text-sm font-medium text-slate-800">{message}</p>
        <button 
          onClick={onClose}
          className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};
