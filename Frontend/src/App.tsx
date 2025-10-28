import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./components/layout/admin/AdminLayout";
import UserLayout from "./components/layout/user/UserLayout";
import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ProductCreate from "./pages/admin/Products/ProductCreate";
import OrderCreate from "./pages/admin/Orders/OrderCreate";
import NotFound from "./pages/error/NotFound";
import Test from "./pages/test/Test";
import OrderDetails from "./pages/admin/Orders/OrderDetails";
import Orders from "./pages/admin/Orders/Orders";
import Products from "./pages/admin/Products/Products";
import { TOAST_CONFIG } from "./configs";
import Branches from "./pages/admin/Branches/Branches";
import Categories from "./pages/admin/Categories/Categories";
import Suppliers from "./pages/admin/Suppliers/Suppliers";
import Inventories from "./pages/admin/Inventories/Inventories";
import Users from "./pages/admin/Users/Users";
import OrderStatistics from "./pages/admin/Orders/OrderStatistics";

const adminRoutes = [
  { index: true, element: <Orders /> },

  { path: "branches", element: <Branches /> },

  { path: "categories", element: <Categories /> },

  { path: "suppliers", element: <Suppliers /> },

  { path: "inventories", element: <Inventories /> },

  { path: "users", element: <Users /> },

  { path: "products", element: <Products /> },
  { path: "products/create", element: <ProductCreate /> },

  { path: "orders", element: <Orders /> },
  { path: "orders/create", element: <OrderCreate /> },
  { path: "orders/:id/products", element: <OrderDetails /> },
  { path: "orders/statistics", element: <OrderStatistics /> },

  { path: "test", element: <Test /> },
];

function App() {
  return (
    <div className="min-w-[300px]">
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          {adminRoutes.map((route, i) => (
            <Route key={i} {...route} />
          ))}
        </Route>

        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Toast Provider */}
      <Toaster
        position={TOAST_CONFIG.POSITION}
        toastOptions={{
          duration: TOAST_CONFIG.DURATION,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 2000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
