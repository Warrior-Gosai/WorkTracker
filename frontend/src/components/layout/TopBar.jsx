import React, { useState } from 'react';
import { Menu, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TopBar = ({ onToggleSidebar, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: User identity & Logout */}
      <div className="flex items-center space-x-4">
        {/* User Card */}
        <div className="flex items-center space-x-3 border-r border-slate-200 pr-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs border border-blue-200">
            {user?.username ? user.username.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-800">
                {user?.username || 'User'}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
              {user?.email || ''}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-300 disabled:opacity-50"
          title="Sign out of DevWork Tracker"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <LogOut className="w-3.5 h-3.5 sm:mr-1.5 text-slate-500 group-hover:text-red-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default TopBar;

