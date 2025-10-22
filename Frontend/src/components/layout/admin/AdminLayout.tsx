import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSelector } from 'react-redux';

const AdminLayout: React.FC = () => {
  const sidebarCollapsed = useSelector((state: any) => state.ui.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}>
        <Header />
        <main className="p-2 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
