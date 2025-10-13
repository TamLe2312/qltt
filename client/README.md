# E-commerce Admin Dashboard

Một dashboard quản trị e-commerce được xây dựng với React, Redux Toolkit, React Router, TanStack Query và Tailwind CSS.

## 🚀 Tính năng

- **Dashboard Overview**: Tổng quan về doanh thu, đơn hàng, khách hàng và sản phẩm
- **Quản lý sản phẩm**: Thêm, sửa, xóa sản phẩm với giao diện thân thiện
- **Quản lý đơn hàng**: Theo dõi và cập nhật trạng thái đơn hàng
- **Quản lý khách hàng**: Xem thông tin và lịch sử mua hàng của khách hàng
- **Analytics**: Phân tích hiệu suất và báo cáo chi tiết
- **Responsive Design**: Tương thích với mọi thiết bị
- **Dark/Light Theme**: Hỗ trợ chế độ sáng/tối

## 🛠️ Công nghệ sử dụng

- **React 18**: Thư viện UI chính
- **TypeScript**: Type safety và developer experience tốt hơn
- **Redux Toolkit**: Quản lý state toàn cục
- **React Router**: Điều hướng trang
- **TanStack Query**: Quản lý server state và caching
- **Tailwind CSS**: Styling framework
- **React Hooks**: Quản lý component state

## 📁 Cấu trúc dự án

```
src/
├── components/           # Các component có thể tái sử dụng
│   ├── ui/              # UI components cơ bản
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   └── layout/          # Layout components
│       ├── Layout.tsx
│       ├── Header.tsx
│       └── Sidebar.tsx
├── pages/               # Các trang chính
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Orders.tsx
│   ├── Customers.tsx
│   └── Analytics.tsx
├── store/               # Redux store
│   ├── store.ts
│   └── slices/
│       ├── authSlice.ts
│       └── uiSlice.ts
├── services/            # API services
│   └── api.ts
├── hooks/               # Custom hooks
│   ├── useAppDispatch.ts
│   └── useAppSelector.ts
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx
└── index.tsx
```

## 🚀 Cài đặt và chạy

1. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

2. **Chạy ứng dụng:**
   ```bash
   npm start
   ```

3. **Build cho production:**
   ```bash
   npm run build
   ```

## 🎨 Component Architecture

### UI Components
- **Button**: Component button với nhiều variant và size
- **Card**: Container component với header và content
- **Input**: Form input với validation và styling
- **Modal**: Popup modal với backdrop và keyboard navigation
- **Table**: Data table với sorting, filtering và pagination

### Layout Components
- **Layout**: Main layout wrapper với sidebar và header
- **Sidebar**: Navigation sidebar với menu items
- **Header**: Top header với search, notifications và user menu

## 🔧 State Management

### Redux Store
- **authSlice**: Quản lý authentication state
- **uiSlice**: Quản lý UI state (sidebar, theme, notifications)

### TanStack Query
- **Caching**: Tự động cache API responses
- **Background Updates**: Tự động refetch data khi cần
- **Optimistic Updates**: Cập nhật UI trước khi API response

## 📱 Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Breakpoints**: 
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

## 🎯 Tính năng chính

### Dashboard
- Thống kê tổng quan
- Biểu đồ doanh thu
- Đơn hàng gần đây
- Metrics hiệu suất

### Products Management
- CRUD operations cho sản phẩm
- Upload hình ảnh
- Quản lý inventory
- Category management

### Orders Management
- Xem danh sách đơn hàng
- Cập nhật trạng thái
- Chi tiết đơn hàng
- Tracking information

### Customers Management
- Danh sách khách hàng
- Thông tin chi tiết
- Lịch sử mua hàng
- Customer analytics

### Analytics
- Revenue analytics
- Product performance
- Customer insights
- Growth metrics

## 🔒 Security Features

- Authentication state management
- Protected routes
- Role-based access control
- Input validation

## 🚀 Performance Optimizations

- Code splitting với React.lazy
- Memoization với React.memo
- Optimized re-renders
- Efficient state updates
- API response caching

## 📊 Monitoring & Analytics

- Error boundaries
- Performance monitoring
- User analytics
- Business metrics

## 🔄 Future Enhancements

- Real-time notifications
- Advanced filtering
- Export functionality
- Bulk operations
- Advanced charts
- Multi-language support
- PWA features

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
