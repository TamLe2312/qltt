/**
 * Application Constants
 * Centralized configuration and constants for the application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 4000,
  POSITION: 'top-right' as const,
} as const;

// Form Configuration
export const FORM_CONFIG = {
  DEBOUNCE_DELAY: 300,
  VALIDATION_MODE: 'onBlur' as const,
} as const;

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  MODAL_SIZES: {
    SM: 'sm',
    MD: 'md', 
    LG: 'lg',
    XL: 'xl',
  } as const,
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  MIN_LENGTH: (min: number) => `Tối thiểu ${min} ký tự`,
  MAX_LENGTH: (max: number) => `Tối đa ${max} ký tự`,
  MIN_VALUE: (min: number) => `Giá trị tối thiểu là ${min}`,
  MAX_VALUE: (max: number) => `Giá trị tối đa là ${max}`,
  POSITIVE_NUMBER: 'Phải là số dương',
  INTEGER: 'Phải là số nguyên',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  SERVER_ERROR: 'Lỗi máy chủ',
  UNAUTHORIZED: 'Không có quyền truy cập',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  UNKNOWN_ERROR: 'Có lỗi không xác định xảy ra',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Tạo đơn hàng thành công',
  ORDER_UPDATED: 'Cập nhật đơn hàng thành công',
  ORDER_DELETED: 'Xóa đơn hàng thành công',
  PRODUCT_ADDED: 'Thêm sản phẩm thành công',
  PRODUCT_UPDATED: 'Cập nhật sản phẩm thành công',
  PRODUCT_DELETED: 'Xóa sản phẩm thành công',
  BRANCH_CREATED: 'Tạo chi nhánh thành công',
  BRANCH_UPDATED: 'Cập nhật chi nhánh thành công',
  BRANCH_DELETED: 'Xóa chi nhánh thành công',
} as const;
