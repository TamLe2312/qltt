import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar, toggleTheme, toggleSidebarCollapsed } from '../../../store/slices/uiSlice';
import { logout } from '../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sidebarOpen = useSelector((state: any) => state.ui.sidebarOpen);
  const sidebarCollapsed = useSelector((state: any) => state.ui.sidebarCollapsed);
  const theme = useSelector((state: any) => state.ui.theme);
  const user = useSelector((state: any) => state.auth.user);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Đăng xuất thành công');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 ">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop sidebar collapse/expand */}
          <button
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="hidden lg:inline-flex items-center gap-2 px-2 py-2 text-gray-600 hover:text-gray-800 rounded-md border border-gray-200 hover:bg-gray-50"
            title={sidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
          >
            {sidebarCollapsed ? (
              // door open icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h11a2 2 0 012 2v14M3 4v16a2 2 0 002 2h11M7 8h2" />
              </svg>
            ) : (
              // door closed icon
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3h10a2 2 0 012 2v16H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 10h.01" />
              </svg>
            )}
            <span className="text-sm hidden xl:inline">{sidebarCollapsed ? 'Mở' : 'Thu gọn'}</span>
          </button>

          {/* <div className="hidden lg:block">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div> */}
        </div>
        
        {/* Right side */}
        <div className="flex items-center justify-end flex-1">
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Hồ sơ
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Cài đặt
                </a>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    handleLogout();
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
