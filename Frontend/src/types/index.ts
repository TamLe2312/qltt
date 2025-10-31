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
    category_name: string;

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
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'failed' | 'refunded' | 'confirmed' | 'canceled';
    note: string;
    total_amount: number;
    street: string;
    ward: string;
    district: string;
    city: string;
    zipcode: string;

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

export interface Inventory {
    id: string;
    product_name: string;
    sku: string;
    branch_name: string;
    quantity: number;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: 'active' | 'inactive';
    totalOrders: number;
    totalSpent: number;
    createdAt: string;
}

export interface User {
    id: string,
    customer_code: string,
    full_name: string,
    email: string
    phone: string,
    status: "active" | "inactive"
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

// Order Create Form Types
export interface OrderCreateForm {
    user_id: string;
    branch_id: string;
    note: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    country: string;
    zipcode: string;
    products: OrderProduct[];
}

export interface OrderProduct {
    product_id: string;
    quantity: number;
    price: number;
    product_name?: string; // For display purposes
    sku?: string; // For display purposes
}

export interface ProductWithInventory extends Product {
    inventory_quantity?: number; // Số lượng tồn kho tại branch
}

// Form Data Types
export interface BranchFormData {
    name: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    country: string;
    zipcode: string;
    email: string;
    phone: string;
}

export interface ProductFormData {
    sku: string;
    name: string;
    price: string;
    avatar: string;
    images: string[];
    unit_of_measure: string;
    status: "active" | "inactive";
    short_description: string;
    description: string;
}

export interface UserFormData {
    customer_code: string;
    full_name: string;
    email: string;
    phone: string;
    status: "active" | "inactive";
}

// Order Product Data (alias for OrderProduct)
export type OrderProductData = OrderProduct;

// Order Create Form Data (alias for OrderCreateForm)
export type OrderCreateFormData = OrderCreateForm;



// Type cho dữ liệu trả về từ api - server pagination
interface Pagination {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

interface Sort {
    field: string;
    order: 'asc' | 'desc';
}

export interface TableData<T> {
    items: T[];
    pagination: Pagination;
    sort: Sort;
}

export interface ApiResponse<T> {
    data: T;
    status: string;
    message: string;
}

export interface OrderFilters {
    startDate?: string;
    endDate?: string;
    status?: string[];
    branchId?: number;
    city?: string;
    userId?: number;
    minTotal?: number;
    maxTotal?: number;
}

export type GroupBy = 'day' | 'month' | 'quarter' | 'year';

export interface OrderStatistics {
    period: string;
    total_orders: number;
    total_amount: number;
}