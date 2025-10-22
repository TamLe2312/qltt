import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../../store/slices/uiSlice';
import { RootState } from '../../../store/store';

interface NavItem {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: 'Chi nhánh',
    href: '/admin/branches',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: 'Danh mục',
    href: '/admin/categories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: 'Nhà cung cấp',
    href: '/admin/suppliers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: 'Sản phẩm',
    href: '/admin/products',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: 'Đơn hàng',
    href: '/admin/orders',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    name: 'Người dùng',
    href: '/admin/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    name: 'Kho hàng',
    href: '/admin/inventories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { sidebarOpen, sidebarCollapsed } = useSelector((state: RootState) => state.ui);
  const location = useLocation();
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);
  const [hoveredMenu, setHoveredMenu] = React.useState<string | null>(null);
  const hoverTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const analyticsItem = navigation.find((item) => item.name === 'Analytics');
    if (
      analyticsItem?.children?.some((child) => location.pathname.startsWith(child.href!)) &&
      !openMenus.includes('Analytics')
    ) {
      setOpenMenus((prev) => [...prev, 'Analytics']);
    }
  }, [location.pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleMouseEnter = (name: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredMenu(name);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoveredMenu(null), 150);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          {!sidebarCollapsed && <h1 className="text-xl font-bold text-gray-900 truncate">Quản trị</h1>}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = hasChildren && openMenus.includes(item.name);
              const isActive =
                (item.href && location.pathname.startsWith(item.href)) ||
                (hasChildren && item.children!.some((sub) => location.pathname.startsWith(sub.href!)));

              return (
                <div key={item.name} className="relative">
                  {item.href ? (
                    <Link
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      {item.icon && (
                        <span className={`mr-3 ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                          {item.icon}
                        </span>
                      )}
                      {!sidebarCollapsed && item.name}
                    </Link>
                  ) : hasChildren && sidebarCollapsed ? (
                    <div
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                      className="relative"
                    >
                      <button
                        className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                      >
                        {item.icon && (
                          <span className={`mr-3 ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                            {item.icon}
                          </span>
                        )}
                      </button>

                      {hoveredMenu === item.name && (
                        <div className="absolute left-full top-0 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                          {item.children!.map((sub) => (
                            <Link
                              key={sub.name}
                              to={sub.href!}
                              className={`block px-3 py-2 text-sm rounded-lg ${location.pathname === sub.href
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      {item.icon && (
                        <span className={`mr-3 ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                          {item.icon}
                        </span>
                      )}
                      {!sidebarCollapsed && item.name}
                      {hasChildren && !sidebarCollapsed && (
                        <svg
                          className={`ml-auto w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  )}

                  {hasChildren && isOpen && !sidebarCollapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children!.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.href!}
                          className={`block px-3 py-2 text-sm rounded-lg ${location.pathname === sub.href
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
