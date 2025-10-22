import React, { useEffect, useState } from 'react';
import { OrderProduct } from '../../../types';
import Input from '../../ui/form/Input';
import { getApi } from '../../../utils';
import { useQuery } from '@tanstack/react-query';
import Button from '../../ui/form/Button';
import Modal from '../../ui/data-display/Modal';
import Table from '../../ui/data-display/Table';

type ApiProduct = {
  id: string;
  quantity: number;
  product_name: string;
  supplier_name: string;
  price: string;
};

interface SelectedProduct {
  product_id: string | number;
  quantity: number | string;
  price: number | string;
}

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string | null;
  selectedProducts: OrderProduct[];
  onAddProducts: (products: OrderProduct[]) => void;
}

// 🔹 Input số lượng có validate onBlur
const QuantityInput: React.FC<{
  value: number;
  max: number;
  onChange: (val: number) => void;
  onFocusSelect?: () => void;
}> = ({ value, max, onChange, onFocusSelect }) => {
  const [text, setText] = useState(value ? String(value) : '');

  useEffect(() => {
    setText(value ? String(value) : '');
  }, [value]);

  const handleBlur = () => {
    const cleaned = text.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);

    if (!cleaned || isNaN(num) || num < 1) {
      setText('1');
      onChange(1);
    } else if (num > max) {
      setText(String(max));
      onChange(max);
    } else {
      setText(String(num));
      onChange(num);
    }
  };

  return (
    <Input
      type="text"
      className="w-12 text-center h-8 border rounded-md"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onFocus={onFocusSelect}
    />
  );
};

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  branchId,
  selectedProducts,
  onAddProducts,
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedProduct[]>([]);

  const getProductsByBranch = (id: string) =>
    getApi(`${process.env.REACT_APP_API_URL}/api/branches/${id}/products`);

  const { data: apiResponse, isLoading: loading } = useQuery({
    queryKey: ['branchProducts', branchId],
    queryFn: () => getProductsByBranch(branchId!),
    enabled: !!branchId && isOpen,
  });

  const products = apiResponse?.data.items ?? [];

  useEffect(() => {
    if (!isOpen) return;
    if (selectedProducts && selectedProducts.length > 0) {
      const existing = selectedProducts.map((p) => ({
        product_id: p.product_id,
        quantity: p.quantity,
        price: p.price,
      }));
      setSelectedItems((prev) => {
        const merged = [...prev];
        existing.forEach((newItem) => {
          if (!merged.some((x) => x.product_id === newItem.product_id)) {
            merged.push(newItem);
          }
        });
        return merged;
      });
    }
  }, [isOpen, selectedProducts]);

  useEffect(() => {
    setSelectedItems([]);
  }, [branchId]);

  const setQuantityFor = (productId: string, qty: number, max: number) => {
    const clamped = Math.max(1, Math.min(Math.floor(qty), max));
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity: clamped } : item
      )
    );
  };

  const toggleSelect = (product: ApiProduct, checked: boolean) => {
    setSelectedItems((prev) => {
      if (checked) {
        if (prev.some((p) => p.product_id === product.id)) return prev;
        return [...prev, { product_id: product.id, quantity: 1, price: product.price }];
      } else {
        return prev.filter((p) => p.product_id !== product.id);
      }
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const all = products
        .filter((p: any) => p.quantity >= 1)
        .map((p: any) => ({ product_id: p.id, quantity: 1, price: p.price }));
      setSelectedItems(all);
    } else {
      setSelectedItems([]);
    }
  };

  // 🔹 Xử lý thêm sản phẩm (ép product_id về string để hợp OrderProduct)
  const handleAddSelected = () => {
    const out: OrderProduct[] = selectedItems.map((sel) => ({
      product_id: String(sel.product_id),
      quantity: Number(sel.quantity),
      price: Number(sel.price),
    }));
    onAddProducts(out);
    onClose();
  };

  const columns: any[] = [
    {
      key: 'select',
      title: '',
      render: (_: any, item: ApiProduct) => {
        const checked = selectedItems.some((p) => p.product_id === item.id);
        const disabled = item.quantity < 1;
        return (
          <input
            type="checkbox"
            className="w-4 h-4 accent-blue-600"
            checked={checked}
            disabled={disabled}
            onChange={(e) => toggleSelect(item, e.target.checked)}
          />
        );
      },
    },
    {
      key: 'product_name',
      title: 'Tên sản phẩm',
      render: (_: any, item: ApiProduct) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{item.product_name}</span>
          <span className="text-sm text-gray-500">{item.supplier_name}</span>
        </div>
      ),
    },
    {
      key: 'price',
      title: 'Giá',
      render: (_: any, item: ApiProduct) => (
        <span className="font-medium">{Number(item.price).toLocaleString()} ₫</span>
      ),
    },
    {
      key: 'stock',
      title: 'Tồn kho',
      render: (_: any, item: ApiProduct) => (
        <span className={`font-medium ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {item.quantity}
        </span>
      ),
    },
    {
      key: 'select_quantity',
      title: 'Số lượng chọn',
      render: (_: any, item: ApiProduct) => {
        const selected = selectedItems.find((x) => x.product_id === item.id);
        const current = selected ? Number(selected.quantity) : 0;
        const max = item.quantity;

        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 flex items-center justify-center"
              onClick={() => {
                const newVal = Math.max(1, (current || 1) - 1);
                if (!selected) {
                  setSelectedItems((prev) => [
                    ...prev,
                    { product_id: item.id, quantity: newVal, price: item.price },
                  ]);
                } else {
                  setQuantityFor(item.id, newVal, max);
                }
              }}
              disabled={current <= 1 || max < 1}
            >
              -
            </Button>

            <QuantityInput
              value={current}
              max={max}
              onChange={(val) => setQuantityFor(item.id, val, max)}
              onFocusSelect={() => {
                if (!selected && item.quantity >= 1) {
                  setSelectedItems((prev) => [
                    ...prev,
                    { product_id: item.id, quantity: 1, price: item.price },
                  ]);
                }
              }}
            />

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 flex items-center justify-center"
              onClick={() => {
                const newVal = Math.min((current || 1) + 1, max);
                if (!selected) {
                  setSelectedItems((prev) => [
                    ...prev,
                    { product_id: item.id, quantity: newVal, price: item.price },
                  ]);
                } else {
                  setQuantityFor(item.id, newVal, max);
                }
              }}
              disabled={current >= max || max < 1}
            >
              +
            </Button>
          </div>
        );
      },
    },
  ];

  const selectedCount = selectedItems.length;
  const totalItems = selectedItems.reduce((sum, p) => sum + Number(p.quantity), 0);
  const selectableProductsCount = products.filter((p: any) => p.quantity >= 1).length;
  const isAllSelected = selectableProductsCount > 0 && selectedItems.length === selectableProductsCount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chọn sản phẩm" size="xl">
      <div className="space-y-4">
        {branchId && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Đang hiển thị sản phẩm của chi nhánh {branchId}
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-600"
                checked={isAllSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
              <span>Chọn tất cả</span>
            </label>
          </div>
        )}

        <div className="border rounded-lg">
          <Table
            data={products || []}
            columns={columns}
            loading={loading}
            emptyMessage="Không có sản phẩm nào"
            className="min-w-full"
          />
        </div>

        {selectedCount > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                Đã chọn {selectedCount} sản phẩm ({totalItems} sản phẩm)
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setSelectedItems([])} variant="outline" size="md">
                  Bỏ chọn hết
                </Button>
                <Button onClick={handleAddSelected} disabled={selectedCount === 0}>
                  Thêm vào đơn hàng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductSelectionModal;
