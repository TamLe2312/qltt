import React from 'react';
import { OrderProductData } from '../../../types';
import { formatCurrency } from '../../../utils';

/**
 * Props interface cho SelectedProductsList
 */
interface SelectedProductsListProps {
  /** Danh sách sản phẩm đã chọn */
  products: OrderProductData[];
  /** Có hiển thị tổng tiền không */
  showTotal?: boolean;
}

/**
 * Component SelectedProductsList - Hiển thị danh sách sản phẩm đã chọn (chỉ xem, không chỉnh sửa)
 */
const SelectedProductsList: React.FC<SelectedProductsListProps> = ({
  products,
  showTotal = true,
}) => {
  // ===== COMPUTED VALUES =====
  const calculateTotal = (): number => {
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  // console.log(products)

  const calculateTotalQuantity = (): number => {
    return products.reduce((total, product) => total + product.quantity, 0);
  };

  // ===== RENDER =====
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có sản phẩm nào
          </h3>
          <p className="text-sm text-gray-600">
            Nhấn <strong>"Chọn sản phẩm"</strong> để thêm sản phẩm vào đơn hàng
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Sản phẩm đã chọn
          </h3>
          <div className="text-sm text-gray-600">
            {products.length} sản phẩm • {calculateTotalQuantity()} đơn vị
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.product_id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {product.product_name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Product ID: {product.product_id}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600">
                    Giá:{' '}
                    <span className="font-medium">
                      {formatCurrency(product.price)}
                    </span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Số lượng:{' '}
                    <span className="font-medium">{product.quantity}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Thành tiền:{' '}
                    <span className="font-semibold text-primary-600">
                      {formatCurrency(product.price * product.quantity)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Summary */}
      {showTotal && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">
                Tổng cộng:
              </span>
              <span className="text-xl font-bold text-primary-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Bao gồm {products.length} sản phẩm • {calculateTotalQuantity()} đơn vị
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedProductsList;
