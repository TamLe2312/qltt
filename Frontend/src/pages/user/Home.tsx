import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
    const user = useSelector((state: any) => state.auth.user);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-12 text-white mb-12">
                <h1 className="text-5xl font-bold mb-4">Chào mừng đến với QLTT</h1>
                <p className="text-xl mb-8">
                    Hệ thống quản lý e-commerce
                </p>
                {!isAuthenticated && (
                    <div className="flex gap-4">
                        <Link to="/login">
                            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                                Đăng nhập
                            </button>
                        </Link>
                        <Link to="/register">
                            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition">
                                Đăng ký ngay
                            </button>
                        </Link>
                    </div>
                )}
                {isAuthenticated && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
                        <p className="text-lg">Xin chào, <span className="font-bold">{user?.name}</span>!</p>
                    </div>
                )}
            </div>

            {/* Admin Link */}
            {isAuthenticated && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Quản trị viên</h3>
                    <Link to="/admin">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                            Truy cập Dashboard
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Home;
