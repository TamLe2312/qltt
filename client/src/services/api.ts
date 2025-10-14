import type {
  Product,
  Order,
  Customer,
  Branch,
  Supplier,
  Inventory,
  GetParamsQuery,
  Category,
} from "../types";
import request from "../ults/request";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data
// const mockProducts: Product[] = [
//   {
//     id: '1',
//     name: 'Hoa',
//     description: 'Latest iPhone with advanced camera system',
//     price: 999,
//     category: 'Electronics',
//     stock: 50,
//     image: 'https://via.placeholder.com/300x200',
//     status: 'active' as const,
//     createdAt: '2024-01-15T10:00:00Z',
//     updatedAt: '2024-01-15T10:00:00Z',
//   },
//   {
//     id: '2',
//     name: 'MacBook Pro M3',
//     description: 'Powerful laptop for professionals',
//     price: 1999,
//     category: 'Electronics',
//     stock: 25,
//     image: 'https://via.placeholder.com/300x200',
//     status: 'active' as const,
//     createdAt: '2024-01-14T10:00:00Z',
//     updatedAt: '2024-01-14T10:00:00Z',
//   },
// ];

// const mockOrders: Order[] = [
//   {
//     id: '1',
//     order_code: 'ggg',
//     customer_address_id: '444',
//     user_id: '1',
//     branch_id: '1',
//     status: 'delivered' as const,
//     note: "string",
//     total_amount: 999,

//     created_at: '2024-01-10T10:00:00Z',
//     updated_at: '2024-01-12T10:00:00Z',
//     deleted_at: '2024-01-12T10:00:00Z',
//   },
// ];

// const mockBranchs: Branch[] = [
//   {
//     "street": "123 Le Loi",
//     "ward": "Ward 1",
//     "district": "Ba Dinh",
//     "city": "Ha Noi",
//     "country": "VN",
//     "zipcode": "100000",
//     "email": "hanoi@shop.com",
//     "phone": "0241234567",
//     "created_at": "2025-09-21T09:56:14.886Z",
//     "updated_at": null,
//     "deleted_at": null,
//     "id": "1",
//     "branch_code": "B001",
//     "name": "Ha Noi Branch"
//   },
//   {
//     "street": "456 Nguyen Hue",
//     "ward": "Ward 2",
//     "district": "Quan 1",
//     "city": "HCM",
//     "country": "VN",
//     "zipcode": "700000",
//     "email": "hcm@shop.com",
//     "phone": "0281234567",
//     "created_at": "2025-09-21T09:56:14.886Z",
//     "updated_at": null,
//     "deleted_at": null,
//     "id": "2",
//     "branch_code": "B002",
//     "name": "HCM Branch"
//   }
// ];

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    avatar: "https://via.placeholder.com/40x40",
    status: "active" as const,
    totalOrders: 5,
    totalSpent: 2500,
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "2",
    name: "Tohn Doe",
    email: "john@example.com",
    phone: "+1234567890",
    avatar: "https://via.placeholder.com/40x40",
    status: "active" as const,
    totalOrders: 7,
    totalSpent: 300,
    createdAt: "2024-01-01T10:00:00Z",
  },
];

export const api = {
  // Products
  // getProducts: async () => {
  //   await delay(500);
  //   return mockProducts;
  // },

  // getProduct: async (id: string) => {
  //   await delay(300);
  //   return mockProducts.find(p => p.id === id);
  // },

  // createProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  //   await delay(500);
  //   const newProduct: Product = {
  //     ...product,
  //     id: Date.now().toString(),
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   };
  //   mockProducts.push(newProduct);
  //   return newProduct;
  // },

  // updateProduct: async (id: string, updates: Partial<Product>) => {
  //   await delay(500);
  //   const index = mockProducts.findIndex(p => p.id === id);
  //   if (index !== -1) {
  //     mockProducts[index] = { ...mockProducts[index], ...updates, updatedAt: new Date().toISOString() };
  //     return mockProducts[index];
  //   }
  //   throw new Error('Product not found');
  // },

  // deleteProduct: async (id: string) => {
  //   await delay(300);
  //   const index = mockProducts.findIndex(p => p.id === id);
  //   if (index !== -1) {
  //     mockProducts.splice(index, 1);
  //     return true;
  //   }
  //   throw new Error('Product not found');
  // },

  // Branchs
  // getBranchs: async () => {
  //   await delay(500);
  //   return mockBranchs;
  // },

  // Orders
  // getOrders: async () => {
  //   await delay(500);
  //   return mockOrders;
  // },

  // getOrder: async (id: string) => {
  //   await delay(300);
  //   return mockOrders.find(o => o.id === id);
  // },

  // updateOrderStatus: async (id: string, status: Order['status']) => {
  //   await delay(500);
  //   const index = mockOrders.findIndex(o => o.id === id);
  //   if (index !== -1) {
  //     mockOrders[index] = { ...mockOrders[index], status, updatedAt: new Date().toISOString() };
  //     return mockOrders[index];
  //   }
  //   throw new Error('Order not found');
  // },

  // Customers
  getCustomers: async () => {
    await delay(500);
    return mockCustomers;
  },

  getCustomer: async (id: string) => {
    await delay(300);
    return mockCustomers.find((c) => c.id === id);
  },

  // Dashboard
  getDashboardStats: async () => {
    await delay(500);
    return {
      totalRevenue: 125000,
      totalOrders: 150,
      totalCustomers: 75,
      totalProducts: 200,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      customersGrowth: 15.2,
      productsGrowth: 5.7,
    };
  },

  getRevenueChart: async () => {
    await delay(300);
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Revenue",
          data: [12000, 15000, 18000, 22000, 25000, 28000],
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "rgba(59, 130, 246, 1)",
        },
      ],
    };
  },

  //Suppliers
  getSuppliers: async () => {
    try {
      const response = await request.get("suppliers");
      return response;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },

  createSupplier: async (supplier: Omit<Supplier, "id">) => {
    try {
      const response = await request.post("suppliers/create ", supplier);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateSupplier: async (id: string, supplier: Partial<Supplier>) => {
    try {
      const response = await request.put(`suppliers/update/${id}`, supplier);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteSupplier: async (id: string) => {
    try {
      const response = await request.delete(`suppliers/delete/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  //Categories
  getCategories: async () => {
    try {
      const response = await request.get("categories/list");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getCategoryTrees: async () => {
    try {
      const response = await request.get("categories");
      return response;
    } catch (error) {
      throw error;
    }
  },

  createCategory: async (category: Omit<Category, "id" | "parent_name">) => {
    try {
      const response = await request.post("categories/create", category);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (id: string, category: Partial<Category>) => {
    try {
      const response = await request.put(`categories/update/${id}`, category);
      return response;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const response = await request.delete(`categories/delete/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  //Branches
  getBranches: async () => {
    try {
      const response = await request.get("branches");
      return response;
    } catch (error) {
      console.error("Error fetching branches:", error);
      throw error;
    }
  },

  createBranch: async (branch: Omit<Branch, "id">) => {
    try {
      const response = await request.post("branches/create", branch);
      return response;
    } catch (error) {
      console.error("Error creating branch:", error);
      throw error;
    }
  },

  updateBranch: async (id: string, updates: Partial<Branch>) => {
    try {
      const response = await request.put(`branches/update/${id}`, updates);
      return response;
    } catch (error) {
      console.error("Error updating branch:", error);
      throw error;
    }
  },

  deleteBranch: async (id: string) => {
    try {
      const response = await request.delete(`branches/delete/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting branch:", error);
      throw error;
    }
  },

  //Inventories
  getInventories: async (params: GetParamsQuery) => {
    try {
      const { page, limit, sortBy, sortOrder } = params;

      const response = await request.get("inventories", {
        params: { page, limit, sortBy, sortOrder },
      });
      return response;
    } catch (error) {
      console.error("Error fetching inventories:", error);
      throw error;
    }
  },

  createInventory: async (
    inventories: Omit<
      Inventory,
      "id" | "branch_name" | "supplier_name" | "product_name" | "sku"
    >
  ) => {
    try {
      const response = await request.post("inventories/create", inventories);
      return response;
    } catch (error) {
      console.error("Error creating inventory:", error);
      throw error;
    }
  },

  updateInventory: async (id: string, updates: Partial<Inventory>) => {
    try {
      const response = await request.put(`inventories/update/${id}`, updates);
      return response;
    } catch (error) {
      console.error("Error updating inventory:", error);
      throw error;
    }
  },
  deleteInventory: async (id: string) => {
    try {
      const response = await request.delete(`inventories/delete/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  //Orders
  getOrders: async () => {
    try {
      const response = await request.get("orders");
      return response;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  // Products
  getProducts: async () => {
    try {
      const response = await request.get("products");
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Users
  getUsers: async () => {
    try {
      const response = await request.get("users");
      return response;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
};
