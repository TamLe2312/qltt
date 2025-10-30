import { useNavigate } from "react-router-dom";
import ReportContainer from "../../../components/features/orders/ReportContainer";
import Card from "../../../components/ui/data-display/Card";
import { loginSuccess, logout, User } from "../../../store/slices/authSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
interface DecodedToken extends User {
  iat: number;
  exp: number;
}
const OrderStatistics: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedUser = jwtDecode<DecodedToken>(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          if (decodedUser.role !== "Admin") {
            toast.error("Không có quyền truy cập. Yêu cầu quyền Admin.");
            navigate(-1);
            return;
          }
          dispatch(loginSuccess(decodedUser));
        } else {
          toast.error("Token đã hết hạn.");
          localStorage.removeItem("accessToken");
          dispatch(logout());
        }
      } catch (error) {
        toast.error("Token không hợp lệ.");
        localStorage.removeItem("accessToken");
        dispatch(logout());
      }
    } else {
      navigate("/");
    }
  }, [dispatch, navigate]);
  return (
    <Card>
      <ReportContainer />
    </Card>
  );
};

export default OrderStatistics;
