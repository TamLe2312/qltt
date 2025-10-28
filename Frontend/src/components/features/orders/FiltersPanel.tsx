import { useState } from 'react';
import { DatePicker, Select, InputNumber, Form, Spin, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { OrderFilters as BaseOrderFilters, GroupBy } from '../../../types';
import { getApi } from '../../../utils';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 🔹 Bổ sung groupBy vào type tạm thời
interface OrderFilters extends BaseOrderFilters {
    groupBy?: GroupBy;
}

interface FiltersPanelProps {
    onChange: (filters: OrderFilters, groupBy?: GroupBy) => void;
}

export default function FiltersPanel({ onChange }: FiltersPanelProps) {
    const defaultState = {
        filters: {},
        groupBy: 'month' as GroupBy,
    };

    const [filters, setFilters] = useState<OrderFilters>(defaultState.filters);
    const [groupBy, setGroupBy] = useState<GroupBy>(defaultState.groupBy);
    const [tempTotals, setTempTotals] = useState<{ minTotal?: number | null; maxTotal?: number | null }>({});
    const [errors, setErrors] = useState<{ minTotal?: string; maxTotal?: string }>({});

    // ✅ API: Lấy danh sách chi nhánh
    const getBranches = () => getApi(`${process.env.REACT_APP_API_URL}/api/branches`);
    const { data: branchesResponse, isLoading: branchesLoading, error: branchesError } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches,
    });
    const branches = branchesResponse?.data.items ?? [];

    // ✅ API: Lấy danh sách user
    const getUsers = () => getApi(`${process.env.REACT_APP_API_URL}/api/users`);
    const { data: usersResponse, isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
    });
    const users = usersResponse?.data.items ?? [];

    const handleChange = (key: keyof OrderFilters, value: any) => {
        const newFilters = { ...filters };

        // ✅ Nếu giá trị rỗng thì xoá key để reset đúng filter
        if (
            value === undefined ||
            value === null ||
            (Array.isArray(value) && value.length === 0) ||
            value === ''
        ) {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }

        setFilters(newFilters);

        if (key === 'groupBy') {
            setGroupBy(value as GroupBy);
            onChange(newFilters, value as GroupBy);
        } else {
            onChange(newFilters, groupBy);
        }
    };


    const handleBlur = (field: 'minTotal' | 'maxTotal') => {
        const min = tempTotals.minTotal ?? filters.minTotal ?? null;
        const max = tempTotals.maxTotal ?? filters.maxTotal ?? null;
        const newErrors: typeof errors = {};

        if (min !== null && max !== null && min > max) {
            newErrors.minTotal = 'Min Total không được lớn hơn Max Total';
            newErrors.maxTotal = 'Max Total không được nhỏ hơn Min Total';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            handleChange('minTotal', min ?? undefined);
            handleChange('maxTotal', max ?? undefined);
        }
    };

    const handleReset = () => {
        setFilters(defaultState.filters);
        setGroupBy(defaultState.groupBy);
        setTempTotals({});
        setErrors({});
        onChange(defaultState.filters, defaultState.groupBy);
    };

    // ✅ Component wrapper có overlay spinner
    const WithSpinner = ({ loading, children }: { loading: boolean; children: React.ReactNode }) => (
        <div style={{ position: 'relative' }}>
            {children}
            {loading && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        zIndex: 10,
                    }}
                >
                    <Spin />
                </div>
            )}
        </div>
    );

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem',
                alignItems: 'start',
            }}
        >
            {/* Cột trái */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 1️⃣ Khoảng thời gian */}
                <RangePicker
                    style={{ width: '100%' }}
                    value={
                        filters.startDate && filters.endDate
                            ? [dayjs(filters.startDate), dayjs(filters.endDate)]
                            : undefined
                    }
                    onChange={(dates) => {
                        const newFilters = { ...filters };

                        if (!dates) {
                            delete newFilters.startDate;
                            delete newFilters.endDate;
                        } else {
                            newFilters.startDate = dates[0]?.format('YYYY-MM-DD');
                            newFilters.endDate = dates[1]?.format('YYYY-MM-DD');
                        }

                        setFilters(newFilters);
                        onChange(newFilters, groupBy);
                    }}
                />


                {/* 2️⃣ Branch */}
                <WithSpinner loading={branchesLoading}>
                    <Select
                        placeholder="Chọn chi nhánh"
                        allowClear
                        disabled={branchesLoading}
                        value={filters.branchId}
                        onChange={(value) => handleChange('branchId', value)}
                        style={{ width: '100%' }}
                    >
                        {branches.map((branch: any) => (
                            <Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Option>
                        ))}
                    </Select>
                </WithSpinner>
                {branchesError && <p style={{ color: 'red', fontSize: 12 }}>Không thể tải danh sách chi nhánh</p>}

                {/* 3️⃣ Min Total */}
                <Form.Item validateStatus={errors.minTotal ? 'error' : ''} help={errors.minTotal} style={{ marginBottom: 0 }}>
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Min Total"
                        value={tempTotals.minTotal ?? filters.minTotal ?? null}
                        onChange={(value) =>
                            setTempTotals((prev) => ({
                                ...prev,
                                minTotal: value === null ? null : value,
                            }))
                        }
                        onBlur={() => handleBlur('minTotal')}
                    />
                </Form.Item>

                {/* 4️⃣ Group By */}
                <Select
                    placeholder="Nhóm theo"
                    allowClear
                    value={groupBy}
                    onChange={(value) => handleChange('groupBy', value)}
                    style={{ width: '100%' }}
                >
                    <Option value="day">Theo ngày</Option>
                    <Option value="month">Theo tháng</Option>
                    <Option value="year">Theo năm</Option>
                </Select>
            </div>

            {/* Cột phải */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 5️⃣ Trạng thái */}
                <Select
                    mode="multiple"
                    allowClear
                    placeholder="Trạng thái"
                    value={filters.status || []}
                    onChange={(values) => handleChange('status', values)}
                    style={{ width: '100%' }}
                >
                    <Option value="pending">Pending</Option>
                    <Option value="confirmed">Confirmed</Option>
                    <Option value="processing">Processing</Option>
                    <Option value="shipped">Shipped</Option>
                    <Option value="delivered">Delivered</Option>
                    <Option value="completed">Completed</Option>
                    <Option value="canceled">Canceled</Option>
                    <Option value="failed">Failed</Option>
                    <Option value="refunded">Refunded</Option>
                </Select>

                {/* 6️⃣ User */}
                <WithSpinner loading={usersLoading}>
                    <Select
                        placeholder="Chọn người dùng"
                        allowClear
                        disabled={usersLoading}
                        value={filters.userId}
                        onChange={(value) => handleChange('userId', value)}
                        style={{ width: '100%' }}
                        showSearch
                        optionFilterProp="children"
                    >
                        {users.map((user: any) => (
                            <Option key={user.id} value={user.id}>
                                {user.full_name || user.name || `User #${user.id}`}
                            </Option>
                        ))}
                    </Select>
                </WithSpinner>
                {usersError && <p style={{ color: 'red', fontSize: 12 }}>Không thể tải danh sách người dùng</p>}

                {/* 7️⃣ Max Total */}
                <Form.Item validateStatus={errors.maxTotal ? 'error' : ''} help={errors.maxTotal} style={{ marginBottom: 0 }}>
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Max Total"
                        value={tempTotals.maxTotal ?? filters.maxTotal ?? null}
                        onChange={(value) =>
                            setTempTotals((prev) => ({
                                ...prev,
                                maxTotal: value === null ? null : value,
                            }))
                        }
                        onBlur={() => handleBlur('maxTotal')}
                    />
                </Form.Item>

                {/* 🔹 Nút Reset */}
                <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                    <Button onClick={handleReset}>Reset bộ lọc</Button>
                </div>
            </div>
        </div>
    );
}
