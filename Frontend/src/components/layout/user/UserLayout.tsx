import { Outlet, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { useState } from 'react';
import Button from '../../ui/form/Button';
import Input from '../../ui/form/Input';
import toast from 'react-hot-toast';

const UserLayout: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
    const user = useSelector((state: any) => state.auth.user);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Đăng xuất thành công');
        navigate('/');
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }

        setIsSearchLoading(true);

        // Simulate API call
        setTimeout(() => {
            toast.success(`Đang tìm kiếm: "${searchQuery}"`);
            setIsSearchLoading(false);
            // Add search logic here later
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center">
                            <h1 className="text-2xl font-bold text-primary-600">QLTT</h1>
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
export default UserLayout;