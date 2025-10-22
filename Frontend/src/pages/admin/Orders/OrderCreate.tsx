import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { getApi, postApi } from '../../../utils';
import { RootState } from '../../../store/store';
import { Branch, OrderProduct } from '../../../types';
import { queryClient } from '../../..';
import { resetData, setData } from '../../../store/slices/orderCreateSlice';
import Card from '../../../components/ui/data-display/Card';
import Input from '../../../components/ui/form/Input';
import DropdownSelect from '../../../components/ui/form/DropdownSelect';
import Button from '../../../components/ui/form/Button';
import SelectedProductsList from '../../../components/features/products/SelectedProductsList';
import ProductSelectionModal from '../../../components/features/products/ProductSelectionModal';
import { useNavigate } from 'react-router-dom';

const OrderCreate: React.FC = () => {

  // Điều hướng
  const navigate = useNavigate();

  // Lấy dữ liệu branch cho Dropdown select
  const getBranches = () =>
    getApi(`${process.env.REACT_APP_API_URL}/api/branches`);
  const getUsers = () => getApi(`${process.env.REACT_APP_API_URL}/api/users`);

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });
  const { data: usersResponse, isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const branches = apiResponse?.data.items ?? [];
  const users = usersResponse?.data.items ?? [];
  // console.log(branches);

  const dispatch = useDispatch();
  const form = useSelector((state: RootState) => state.orderCreate);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);

  // Yup schema
  const SelectedProductSchema = Yup.object({
    product_id: Yup.number()
      .typeError('product_id phải là số')
      .required('product_id là bắt buộc'),
    quantity: Yup.number()
      .typeError('quantity phải là số')
      .min(1, 'quantity phải >= 1')
      .required('quantity là bắt buộc'),
    price: Yup.number()
      .typeError('price phải là số')
      .min(0, 'price phải >= 0')
      .required('price là bắt buộc'),
  });

  const OrderCreateStateSchema = Yup.object({
    user_id: Yup.string().required('user_id là bắt buộc'),
    branch_id: Yup.string().required('branch_id là bắt buộc'),
    note: Yup.string().nullable().notRequired(),
    street: Yup.string().required('street là bắt buộc'),
    ward: Yup.string().required('ward là bắt buộc'),
    district: Yup.string().required('district là bắt buộc'),
    city: Yup.string().required('city là bắt buộc'),
    country: Yup.string().required('country là bắt buộc'),
    zipcode: Yup.string().required('zipcode là bắt buộc'),
    products: Yup.array()
      .of(SelectedProductSchema)
      .min(1, 'Phải có ít nhất 1 sản phẩm')
      .required('products là bắt buộc'),
  });

  const handleValidateData = async (data: Partial<typeof form>) => {
    const merged = { ...form, ...data };
    try {
      await OrderCreateStateSchema.validate(merged, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errorObj: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) errorObj[e.path] = e.message;
        });
        setErrors(errorObj);
      }
      return false;
    }
  };

  const handleSelectProducts = () => {
    if (!form.branch_id) {
      toast.error('Vui lòng chọn chi nhánh trước khi chọn sản phẩm!');
      return;
    }
    setIsProductModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!form.branch_id) {
        toast.error('Vui lòng chọn chi nhánh trước khi tạo đơn hàng!');
        return;
      }

      const isValid = await handleValidateData({});
      if (!isValid) {
        toast.error('Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại!');
        return;
      }

      const formData = new FormData();
      const appendFormData = (data: any, rootKey: string | null = null) => {
        if (data === null || data === undefined) return;
        if (typeof data === 'object' && !Array.isArray(data) && !(data instanceof Blob)) {
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              appendFormData(data[key], rootKey ? `${rootKey}[${key}]` : key);
            }
          }
        } else if (Array.isArray(data)) {
          data.forEach((item, index) => {
            appendFormData(item, `${rootKey}[${index}]`);
          });
        } else {
          if (!rootKey) {
            console.warn('Cannot append value without key', data);
            return;
          }
          formData.append(rootKey, data instanceof Blob ? data : String(data));
        }
      };
      appendFormData(form);

      await postApi(`${process.env.REACT_APP_API_URL}/api/orders/create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      dispatch(resetData());
      toast.success('Tạo đơn hàng thành công!');

      navigate('/admin/orders');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tạo đơn hàng!');
    }
  };

  // Reset products khi branch thay đổi
  useEffect(() => {
    if (form.products && form.products.length > 0) {
      dispatch(setData({ products: [] }));
    }
  }, [form.branch_id]);

  return (
    <Card>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tạo đơn hàng mới</h1>
        <p className="text-gray-600 mt-1">Nhập thông tin để tạo đơn hàng mới</p>
      </div>

      <div className="space-y-6">
        {/* Order Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
          <div>
            <DropdownSelect
              data={users}
              value={form.user_id || ''}
              onChange={(value) => {
                const newData = { user_id: String(value) };
                dispatch(setData(newData));
                handleValidateData(newData);
              }}
              placeholder="Chọn khách hàng"
              labelKey="full_name"  // hoặc field hiển thị tên khách hàng
              valueKey="id"         // hoặc field chứa ID khách hàng
              defaultOptionLabel="Chọn khách hàng"
              loading={isUsersLoading}
              disabled={isUsersLoading}
            />
            <p className="mt-1 h-5 text-sm text-red-600">{errors.user_id}</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh *</label>
              <DropdownSelect
                data={branches || []}
                value={form.branch_id || ''}
                onChange={(value) => {
                  const newData = { branch_id: String(value) };
                  dispatch(setData(newData));
                  handleValidateData(newData);
                }}
                placeholder="Chọn chi nhánh"
                labelKey="name"
                valueKey="id"
                defaultOptionLabel="Chọn chi nhánh"
                loading={isLoading}
                disabled={isLoading}
              />
              <p className="mt-1 h-5 text-sm text-red-600">{errors.branch_id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                placeholder="Nhập ghi chú cho đơn hàng"
                onBlur={(e) => {
                  const value = e.target.value;
                  const newData = { note: value ? String(value) : null };
                  dispatch(setData(newData));
                  handleValidateData(newData);
                }}
              />
              <p className="mt-1 h-5 text-sm text-red-600">{errors.note}</p>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin địa chỉ giao hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'street', label: 'Đường/Phố' },
              { key: 'ward', label: 'Phường/Xã' },
              { key: 'district', label: 'Quận/Huyện' },
              { key: 'city', label: 'Thành phố' },
              { key: 'country', label: 'Quốc gia' },
              { key: 'zipcode', label: 'Mã bưu điện' },
            ].map(({ key, label }) => (
              <Input
                key={key}
                label={label}
                placeholder={`Nhập ${label.toLowerCase()}`}
                error={errors[key]}
                onBlur={(e) => {
                  const value = e.target.value;
                  const newData = { [key]: value ? String(value) : null };
                  dispatch(setData(newData));
                  handleValidateData(newData);
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-between">
            <div className="my-2">
              <h2 className="text-lg font-semibold text-gray-900">Sản phẩm</h2>
              <p className="text-sm text-gray-600 mt-1">
                Chọn sản phẩm từ chi nhánh đã chọn
              </p>
            </div>
            <Button
              className="my-2"
              type="button"
              onClick={handleSelectProducts}
              variant="outline"
              size="lg"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Chọn sản phẩm
            </Button>
          </div>

          <SelectedProductsList
            products={(form.products as OrderProduct[]) || []}
          />
          <p className="h-5 mt-2 text-sm text-red-600">{errors.products}</p>
        </div>

        <div className="flex justify-end">
          <Button disabled={isLoading} onClick={handleSubmit} size="lg">
            Tạo đơn hàng
          </Button>
        </div>
      </div>

      {/* Product Modal */}
      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        branchId={String(form.branch_id)}
        selectedProducts={(form.products as OrderProduct[]) || []}
        onAddProducts={(val) => {
          const newData = { products: val };
          dispatch(setData(newData));
          handleValidateData(newData);
        }}
      />
    </Card>
  );
};

export default OrderCreate;