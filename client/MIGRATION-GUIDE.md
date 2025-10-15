# 🔄 Migration Guide - OrdersCreate System Upgrade

## 📋 Tổng quan Migration

Hướng dẫn chuyển đổi từ hệ thống OrdersCreate cũ sang hệ thống mới với React Query, Yup validation, và UI/UX được cải thiện.

## 🚀 Breaking Changes

### **1. Dependencies Changes**
```bash
# Cài đặt dependencies mới
npm install @hookform/resolvers yup @tanstack/react-query react-hot-toast

# Xóa dependencies cũ (nếu có)
npm uninstall react-query  # Nếu đang dùng version cũ
```

### **2. Import Changes**

#### **Before (Old)**
```typescript
import { useForm } from 'react-hook-form';
import { api } from '../services/api';
import ProductSelectionModal from '../components/ui/ProductSelectionModal';
import SelectedProductsList from '../components/ui/SelectedProductsList';
```

#### **After (New)**
```typescript
import { useOrderCreation } from '../../hooks';
import ProductSelectionModal from '../../components/modals/ProductSelectionModal';
import SelectedProductsList from '../../components/lists/SelectedProductsList';
```

### **3. Component Structure Changes**

#### **Before (Old)**
```typescript
const OrdersCreate: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<OrderCreateForm>();
  
  // Manual API calls
  const loadBranches = async () => { ... };
  const handleSubmit = async (data: OrderCreateForm) => { ... };
  
  // Manual state management
  const handleAddProducts = (newProducts: OrderProduct[]) => { ... };
  const handleRemoveProduct = (productId: string) => { ... };
  
  return (
    <div>
      {/* Manual form implementation */}
    </div>
  );
};
```

#### **After (New)**
```typescript
const OrdersCreate: React.FC = () => {
  const {
    form,
    selectedProducts,
    isProductModalOpen,
    selectedBranchId,
    branches,
    products,
    branchesLoading,
    productsLoading,
    isSubmitting,
    totalAmount,
    handleBranchChange,
    handleAddProducts,
    handleRemoveProduct,
    handleUpdateQuantity,
    handleSubmit,
    setIsProductModalOpen,
  } = useOrderCreation();

  const { register, handleSubmit: formHandleSubmit, formState: { errors } } = form;

  return (
    <div>
      {/* Simplified form implementation */}
    </div>
  );
};
```

## 🔧 Step-by-Step Migration

### **Step 1: Update App.tsx**

#### **Before**
```typescript
function App() {
  return (
    <div className="min-w-[300px]">
      <Routes>
        {/* Routes */}
      </Routes>
    </div>
  );
}
```

#### **After**
```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { TOAST_CONFIG } from './constants';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-w-[300px]">
        <Routes>
          {/* Routes */}
        </Routes>
        
        <Toaster
          position={TOAST_CONFIG.POSITION}
          toastOptions={{
            duration: TOAST_CONFIG.DURATION,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}
```

### **Step 2: Update Folder Structure**

#### **Create New Folders**
```bash
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/components/forms
mkdir -p src/components/modals
mkdir -p src/components/lists
mkdir -p src/utils
mkdir -p src/constants
mkdir -p src/validations
mkdir -p src/services/queries
```

#### **Move Files**
```bash
# Move components to appropriate folders
mv src/components/ui/ProductSelectionModal.tsx src/components/modals/
mv src/components/ui/SelectedProductsList.tsx src/components/lists/

# Create new files
touch src/lib/queryClient.ts
touch src/hooks/index.ts
touch src/hooks/queries.ts
touch src/validations/index.ts
touch src/utils/index.ts
touch src/constants/index.ts
```

### **Step 3: Update Types**

#### **Before**
```typescript
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
```

#### **After**
```typescript
// In src/validations/index.ts
export const orderCreateSchema = yup.object({
  user_id: yup.string().required().min(1),
  branch_id: yup.string().required().min(1),
  note: yup.string().max(500).optional(),
  street: yup.string().required().min(5).max(200),
  ward: yup.string().required().min(2).max(100),
  district: yup.string().required().min(2).max(100),
  city: yup.string().required().min(2).max(100),
  country: yup.string().required().min(2).max(50),
  zipcode: yup.string().required().matches(/^[0-9]{5,10}$/),
  products: yup.array().of(orderProductSchema).min(1).required(),
});

export type OrderCreateFormData = yup.InferType<typeof orderCreateSchema>;
```

### **Step 4: Update API Service**

#### **Before**
```typescript
export const api = {
  getBranches: async () => {
    await delay(500);
    return mockBranchs;
  },
  getProductsByBranch: async (branchId: string) => {
    await delay(500);
    return mockProducts;
  },
};
```

#### **After**
```typescript
// In src/services/api.ts
import axios from 'axios';
import { API_CONFIG } from '../constants';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

export const apiEndpoints = {
  branches: {
    list: () => api.get<Branch[]>('/branches'),
    detail: (id: string) => api.get<Branch>(`/branches/${id}`),
    create: (data: BranchFormData) => api.post<Branch>('/branches', data),
  },
  products: {
    byBranch: (branchId: string) => api.get<ProductWithInventory[]>(`/branches/${branchId}/products`),
    list: (filters?: Record<string, any>) => api.get<Product[]>('/products', { params: filters }),
  },
  orders: {
    create: (data: OrderCreateFormData) => api.post<Order>('/orders', data),
  },
};
```

### **Step 5: Update Components**

#### **ProductSelectionModal Changes**

##### **Before**
```typescript
const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  branchId,
  selectedProducts,
  onAddProducts,
}) => {
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  const loadProducts = async () => {
    // Manual API call
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    // Manual state management
  };
```

##### **After**
```typescript
const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  branchId,
  selectedProducts,
  onAddProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, { checked: boolean; quantity: number }>>(new Map());

  const {
    products,
    isLoading,
    selectedCount,
    totalItems,
    handleQuantityChange,
    handleAddSelected,
    initializeSelectedItems,
  } = useProductSelection(branchId, selectedProducts, onAddProducts);
```

### **Step 6: Update Form Implementation**

#### **Before**
```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
  setValue,
  watch,
  reset,
} = useForm<OrderCreateForm>({
  defaultValues: {
    user_id: '',
    branch_id: '',
    note: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    country: 'VN',
    zipcode: '',
    products: [],
  },
});
```

#### **After**
```typescript
const {
  form,
  selectedProducts,
  isProductModalOpen,
  selectedBranchId,
  branches,
  products,
  branchesLoading,
  productsLoading,
  isSubmitting,
  totalAmount,
  handleBranchChange,
  handleAddProducts,
  handleRemoveProduct,
  handleUpdateQuantity,
  handleSubmit,
  setIsProductModalOpen,
} = useOrderCreation();

const { register, handleSubmit: formHandleSubmit, formState: { errors } } = form;
```

## 🔍 Key Differences

### **1. State Management**

#### **Before: Manual State**
```typescript
const [branches, setBranches] = useState<Branch[]>([]);
const [loading, setLoading] = useState(false);
const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);

const loadBranches = async () => {
  setLoading(true);
  try {
    const data = await api.getBranches();
    setBranches(data);
  } catch (error) {
    console.error('Error loading branches:', error);
  } finally {
    setLoading(false);
  }
};
```

#### **After: React Query**
```typescript
const { data: branches = [], isLoading: branchesLoading } = useBranches();
const { data: products = [], isLoading: productsLoading } = useProductsByBranch(
  selectedBranchId || '',
  !!selectedBranchId
);
```

### **2. Form Validation**

#### **Before: Manual Validation**
```typescript
const onSubmit = async (data: OrderCreateForm) => {
  if (selectedProducts.length === 0) {
    alert('Vui lòng chọn ít nhất một sản phẩm');
    return;
  }
  // Manual validation logic
};
```

#### **After: Yup Schema**
```typescript
const form = useForm<OrderCreateFormData>({
  resolver: yupResolver(validationSchemas.orderCreate),
  defaultValues: { ... },
  mode: 'onBlur',
});
```

### **3. Error Handling**

#### **Before: Alert/Console**
```typescript
try {
  await createOrder(data);
  alert('Tạo đơn hàng thành công!');
} catch (error) {
  console.error('Error creating order:', error);
  alert('Có lỗi xảy ra khi tạo đơn hàng');
}
```

#### **After: Toast Notifications**
```typescript
const createOrderMutation = useCreateOrder(); // Auto handles success/error toasts

await createOrderMutation.mutateAsync(data);
// Success toast automatically shown
```

### **4. UI Components**

#### **Before: Basic Input**
```typescript
<input
  type="number"
  value={currentQuantity}
  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
  min={0}
  max={maxQuantity}
  className="w-20 text-center"
/>
```

#### **After: QuantityInput Component**
```typescript
<QuantityInput
  value={currentQuantity}
  onChange={(quantity) => handleQuantityChange(item.id, quantity)}
  min={1}
  max={maxQuantity}
  size="sm"
  showButtons={true}
/>
```

## 🚨 Common Issues & Solutions

### **Issue 1: Import Errors**
```typescript
// Error: Cannot find module '../../hooks'
// Solution: Check file paths after folder restructuring
import { useOrderCreation } from '../../hooks';
```

### **Issue 2: Type Errors**
```typescript
// Error: Type 'OrderCreateForm' is not assignable to type 'OrderCreateFormData'
// Solution: Use new type from validations
import { OrderCreateFormData } from '../validations';
```

### **Issue 3: React Query Errors**
```typescript
// Error: useQuery must be used within a QueryClientProvider
// Solution: Wrap App with QueryClientProvider
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### **Issue 4: Toast Not Showing**
```typescript
// Error: Toast not appearing
// Solution: Add Toaster component to App.tsx
import { Toaster } from 'react-hot-toast';
<Toaster position="top-right" />
```

## ✅ Migration Checklist

- [ ] **Dependencies**: Install new packages
- [ ] **App.tsx**: Add QueryClientProvider and Toaster
- [ ] **Folder Structure**: Create new folders and move files
- [ ] **Types**: Update type definitions
- [ ] **API Service**: Update API service with new structure
- [ ] **Components**: Update component implementations
- [ ] **Hooks**: Create custom hooks
- [ ] **Validation**: Add Yup schemas
- [ ] **Constants**: Add app constants
- [ ] **Utils**: Add utility functions
- [ ] **Testing**: Update tests for new structure
- [ ] **Documentation**: Update documentation

## 🎯 Benefits After Migration

### **Developer Experience**
- ✅ **Better Type Safety**: Full TypeScript support
- ✅ **Cleaner Code**: Custom hooks và separation of concerns
- ✅ **Better Error Handling**: Centralized error management
- ✅ **Easier Testing**: Isolated business logic

### **User Experience**
- ✅ **Better Performance**: React Query caching
- ✅ **Better Feedback**: Toast notifications
- ✅ **Better Validation**: Real-time validation
- ✅ **Better UX**: Loading states và disabled states

### **Maintainability**
- ✅ **Better Organization**: Clear folder structure
- ✅ **Reusable Components**: Modular components
- ✅ **Centralized Configuration**: Constants và configs
- ✅ **Better Documentation**: Comprehensive docs

## 🚀 Next Steps

After migration:

1. **Test thoroughly** all functionality
2. **Update documentation** for team
3. **Train team members** on new patterns
4. **Plan next features** using new architecture
5. **Monitor performance** và optimize if needed

---

**Migration hoàn tất!** Hệ thống mới sẵn sàng cho production và future development! 🎉
