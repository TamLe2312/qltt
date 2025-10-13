import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Branches from "./pages/Branches";
import Inventories from "./pages/Inventories";
import OrderDetails from "./pages/OrderDetails";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";
import Users from "./pages/Users";
import CreateOrder from "./pages/user/CreateOrder";
import AdminLayout from "./components/layout/admin/AdminLayout";
import UserLayout from "./components/layout/user/UserLayout";
import Home from "./pages/user/Home";
import Categories from "./pages/admin/Categories";
import BranchCreate from "./pages/admin/BranchCreate";
import UploadPage from "./pages/admin/UploadPage";
import Suppliers from "./pages/Suppliers";

function App() {
  return (
    <div className="min-w-[300px]">
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="branches" element={<Branches />} />
          <Route path="branch-create" element={<BranchCreate />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/order-details/:id" element={<OrderDetails />} />
          <Route path="users" element={<Users />} />
          <Route path="categories" element={<Categories />} />
          <Route path="inventories" element={<Inventories />} />
          <Route path="suppliers" element={<Suppliers />} />
          {/* <Route path="test" element={<Test />} /> */}
          <Route path="test" element={<UploadPage />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="createOrder" element={<CreateOrder />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
