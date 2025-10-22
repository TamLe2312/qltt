// Toast Configuration
export const TOAST_CONFIG = {
    DURATION: 4000,
    POSITION: 'top-right' as const,
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