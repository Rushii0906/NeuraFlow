import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Brain, LayoutDashboard, User, LogOut } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={16} />,
      path: '/dashboard',
    },
    {
      label: 'Profile',
      icon: <User size={16} />,
      path: '/profile',
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white text-[#37352f]">
      {/* Sidebar - Persistent on desktop, hidden on mobile */}
      <aside className="hidden md:flex w-64 border-r border-[#e5e3df] bg-[#f6f5f4] flex-col justify-between p-5 flex-shrink-0 no-print">
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 mb-10 hover:opacity-90">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-[#e5e3df] overflow-hidden">
              <img src="/logo.png" className="w-6 h-6 object-contain" alt="NeuraFlow Logo" />
            </div>
            <span className="text-lg font-bold tracking-tight font-['Outfit'] text-[#1a1a1a]">
              NeuraFlow AI
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 text-xs font-semibold ${
                    isActive
                      ? 'bg-white border border-[#e5e3df] text-[#1a1a1a] shadow-sm'
                      : 'text-[#787671] hover:bg-[#ede9e4] hover:text-[#1a1a1a]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-[#e5e3df] pt-5 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#1a1a1a] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#787671] truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-[#787671] hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all duration-150 text-xs font-semibold cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fafaf9]">
        {/* Header */}
        <header className="h-16 border-b border-[#e5e3df] bg-white flex items-center justify-between px-6 md:px-8 no-print">
          <div className="flex items-center space-x-4">
            {/* Mobile Logo */}
            <Link to="/" className="flex items-center space-x-2 md:hidden">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-[#e5e3df] overflow-hidden">
                <img src="/logo.png" className="w-5 h-5 object-contain" alt="NeuraFlow Logo" />
              </div>
            </Link>
            
            <h1 className="text-xs md:text-sm font-bold font-['Outfit'] text-[#1a1a1a]">
              {location.pathname === '/dashboard' ? 'Welcome Back!' : 'Learning Console'}
            </h1>
          </div>

          {/* Mobile Top Navigation Navigation Links */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-1.5 md:hidden mr-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                      isActive
                        ? 'bg-[#3d27bc]/10 text-[#3d27bc]'
                        : 'text-[#787671] hover:text-[#1a1a1a]'
                    }`}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="p-1 rounded-md text-[#787671] hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>

            <Link
              to="/"
              className="text-[10px] md:text-[11px] text-[#3d27bc] font-bold px-2.5 py-1.5 rounded-lg border border-[#3d27bc]/20 bg-[#3d27bc]/5 hover:bg-[#3d27bc]/10 transition-all no-print"
            >
              Explore Platform
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
