import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/slices/authSlice";
import Input from "../../components/ui/form/Input";
import Button from "../../components/ui/form/Button";
import { isValidEmail, postApi } from "../../utils";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
    });
    setErrors({});
  };
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "Email là bắt buộc";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  interface AuthResponse {
    accessToken: string;
  }
  const loginMutation = useMutation<AuthResponse, Error, typeof formData>({
    mutationFn: (newUser: typeof formData) =>
      postApi(`${process.env.REACT_APP_API_URL}/api/auth/login`, newUser),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);

      toast.success("Đăng nhập thành công!");
      resetForm();
      navigate("/");
    },
    onError: () => {
      toast.error("Đăng nhập thất bại");
    },
  });
  // ================== HANDLERS ==================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin đăng nhập");
      return;
    }
    setIsLoading(true);
    loginMutation.mutate(formData, {
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Đăng nhập
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Chào mừng bạn trở lại
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            placeholder="nhap@email.com"
            disabled={isLoading}
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={errors.password}
            placeholder="Nhập mật khẩu của bạn"
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
            Đăng nhập
          </Button>

          {/* Register Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Đăng ký ngay
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
