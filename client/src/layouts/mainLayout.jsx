import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Home/Footer/Footer";
import Header from "../components/Home/Header/Header";
import NavBar from "../components/Home/NavBar/NavBar";

export default function MainLayout() {
  return (
    <>
      <Header />
      <NavBar />
      <div className="mt-8">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
