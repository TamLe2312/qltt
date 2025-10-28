import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout, User } from "../../../store/slices/authSlice";
interface DecodedToken extends User {
  iat: number;
  exp: number;
}
const AdminLayout: React.FC = () => {
  const sidebarCollapsed = useSelector(
    (state: any) => state.ui.sidebarCollapsed
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedUser = jwtDecode<DecodedToken>(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          dispatch(loginSuccess(decodedUser));
        } else {
          console.error("Token đã hết hạn.");
          localStorage.removeItem("accessToken");
          dispatch(logout());
        }
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        localStorage.removeItem("accessToken");
        dispatch(logout());
      }
    } else {
      navigate("/");
    }
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className={sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}>
        <Header />
        <main className="p-2 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
