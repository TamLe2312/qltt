export interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  avatar: string;
  images: string[];
  unit_of_measure: string;
  status: "active" | "inactive";
  short_description: string;
  description: string;

  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface Order {
  id: string;
  order_code: string;
  customer_address_id: string;
  user_id: string;
  branch_id: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled";
  note: string;
  total_amount: number;
  shipping_street: string;
  shipping_ward: string;
  shipping_district: string;
  shipping_city: string;
  shipping_zipcode: string;

  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface OrderDetail {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Branch {
  id: string;
  name: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  zipcode: string;
  email: string;
  phone: string;

  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  zipcode: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  product_name: string;
  branch_id: string;
  branch_name: string;
  supplier_id: string;
  supplier_name: string;
  sku: string;
  quantity: number;
  reserved_stock: number;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  parent_name?: string | null;
}

export interface GetParamsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: "active" | "inactive";
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface User {
  id: string;
  customer_code: string;
  full_name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}
