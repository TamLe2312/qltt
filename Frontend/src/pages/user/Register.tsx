import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/ui/form/Input';
import Button from '../../components/ui/form/Button';
import { isValidEmail, isValidVietnamesePhone } from '../../utils';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
        confirmPassword?: string;
    }>({});
    const [isLoading, setIsLoading] = useState(false);

    // ================== VALIDATION ==================
    const validate = (): boolean => {
        const newErrors: any = {};

        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Họ tên phải có ít nhất 3 ký tự';
        }

        if (!formData.email) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.phone) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        } else if (!isValidVietnamesePhone(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ================== HANDLERS ==================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Vui lòng kiểm tra lại thông tin đăng ký');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            toast.success('Đăng ký thành công!');
            navigate('/login');
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Đăng ký</h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">Tạo tài khoản mới</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
                    <Input
                        label="Họ và tên"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        error={errors.name}
                        placeholder="Nguyễn Văn A"
                        disabled={isLoading}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            error={errors.email}
                            placeholder="email@example.com"
                            disabled={isLoading}
                        />

                        <Input
                            label="Số điện thoại"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            error={errors.phone}
                            placeholder="0912345678"
                            disabled={isLoading}
                        />
                    </div>

                    <Input
                        label="Mật khẩu"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        error={errors.password}
                        placeholder="Tối thiểu 6 ký tự"
                        disabled={isLoading}
                    />

                    <Input
                        label="Xác nhận mật khẩu"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        error={errors.confirmPassword}
                        placeholder="Nhập lại mật khẩu"
                        disabled={isLoading}
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full"
                    >
                        Đăng ký
                    </Button>

                    {/* Login Link */}
                    <div className="text-center">
                        <span className="text-sm text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-primary-600 hover:text-primary-700"
                            >
                                Đăng nhập ngay
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
