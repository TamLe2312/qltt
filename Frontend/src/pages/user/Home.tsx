import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

interface DecodedToken {
  userId: number;
  username: string;
  role: string;
  roleId: number;
  iat: number;
  exp: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedUser = jwtDecode<DecodedToken>(token);

        const userRole = decodedUser.roleId;

        if (userRole === 1 || userRole === 3) {
          navigate("/admin");
        }
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        localStorage.removeItem("accessToken");
      }
    }
  }, [navigate]);
  return <>Home</>;
};

export default Home;
