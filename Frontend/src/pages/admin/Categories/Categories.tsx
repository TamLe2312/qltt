import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getApi, postApi } from "../../../utils";
import Button from "../../../components/ui/form/Button";
import Card from "../../../components/ui/data-display/Card";
import { useNavigate } from "react-router-dom";
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
} from "lucide-react";
import Modal from "../../../components/ui/data-display/Modal";
import Input from "../../../components/ui/form/Input";
import DropdownSelect from "../../../components/ui/form/DropdownSelect";

// =======================
// INTERFACES
// =======================
interface CategoryOption {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
}

interface CategoryNode {
    id: string;
    name: string;
    parent_id: string | null;
    path: string[];
    subcategories: CategoryNode[];
}

interface TableColumn<T> {
    key: string;
    label: string;
    width?: string;
    render?: (item: T, level: number) => React.ReactNode;
}

interface TableCategoryProps {
    data: CategoryNode[];
    columns: TableColumn<CategoryNode>[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: CategoryNode) => void;
    className?: string;
}

// =======================
// TABLE COMPONENT
// =======================
const TableCategory: React.FC<TableCategoryProps> = ({
    data,
    columns,
    loading = false,
    emptyMessage = "No data available",
    onRowClick,
    className = "",
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const renderRows = (items: CategoryNode[], level = 0) =>
        items.map((item) => {
            const hasChildren = item.subcategories.length > 0;
            const isExpanded = expanded[item.id];

            return (
                <React.Fragment key={item.id}>
                    <tr
                        className={`hover:bg-gray-50 transition-colors ${level === 0
                            ? "bg-blue-50 font-semibold"
                            : "bg-white text-gray-700"
                            } ${onRowClick ? "cursor-pointer" : ""}`}
                        onClick={() => onRowClick?.(item)}
                    >
                        {columns.map((col) => (
                            <td
                                key={col.key}
                                className="px-6 py-3 text-sm whitespace-nowrap"
                                style={{ width: col.width }}
                            >
                                {col.render ? (
                                    col.render(item, level)
                                ) : col.key === "name" ? (
                                    <div
                                        className="flex items-center"
                                        style={{ paddingLeft: `${level * 24}px` }}
                                    >
                                        <div className="w-5 flex justify-center">
                                            {hasChildren ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleExpand(item.id);
                                                    }}
                                                    className="text-gray-500 hover:text-gray-800"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown size={16} />
                                                    ) : (
                                                        <ChevronRight size={16} />
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="inline-block w-4" />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {level === 0 ? (
                                                <FolderOpen size={16} className="text-blue-600" />
                                            ) : (
                                                <Folder size={14} className="text-gray-500" />
                                            )}
                                            <span
                                                className={`${level === 0
                                                    ? "text-blue-900 font-medium"
                                                    : "text-gray-800 font-normal"
                                                    }`}
                                            >
                                                {item.name}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    (item as any)[col.key]
                                )}
                            </td>
                        ))}
                    </tr>

                    {isExpanded &&
                        hasChildren &&
                        renderRows(item.subcategories, level + 1)}
                </React.Fragment>
            );
        });

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8 text-center">
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto ${className}`}
        >
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={{ width: col.width }}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {renderRows(data)}
                </tbody>
            </table>
        </div>
    );
};

// =======================
// API FUNCTION
// =======================
const getCategoriesTree = () =>
    getApi(`${process.env.REACT_APP_API_URL}/api/categories/tree`);

const getCategories = () =>
    getApi(`${process.env.REACT_APP_API_URL}/api/categories`);

const createCategoryApi = (data: { name: string; parent_id?: string | null }) =>
    postApi(`${process.env.REACT_APP_API_URL}/api/categories/create`, data);

// =======================
// MAIN PAGE COMPONENT
// =======================
const Categories: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ["categoriesTree"],
        queryFn: getCategoriesTree,
    });

    const { data: apiResponseCategories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    const categoriesTree = apiResponse?.data.items ?? [];
    const categories = apiResponseCategories?.data.items ?? [];

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", parent_id: "" });

    const resetForm = () => setFormData({ name: "", parent_id: "" });

    // Mutation tạo category
    const createCategoryMutation = useMutation({
        mutationFn: createCategoryApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categoriesTree"] });
            setIsModalOpen(false);
            resetForm();
        },
        onError: (err: any) => {
            console.error(err);
            alert("Tạo danh mục thất bại");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createCategoryMutation.mutate({
            name: formData.name,
            parent_id: formData.parent_id || null,
        });
    };

    const columns: TableColumn<CategoryNode>[] = [
        { key: "id", label: "ID", width: "80px" },
        { key: "name", label: "Tên danh mục" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
                    <p className="text-gray-600">Quản lý các danh mục của bạn</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>Mới</Button>
            </div>

            {/* Categories Table */}
            <Card>
                <TableCategory
                    data={categoriesTree || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không tìm thấy danh mục nào"
                />
            </Card>

            {/* Modal tạo category */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title="Thêm danh mục mới"
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Tên danh mục"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        required
                    />
                    <div className="h-72">
                        <DropdownSelect
                            labelKey="label"
                            valueKey="value"
                            value={formData.parent_id}
                            placeholder="Chọn danh mục cha"
                            data={[
                                { value: "", label: "—ROOT—" },
                                ...categories.map((c: CategoryOption) => ({
                                    value: c.id,
                                    label: c.name
                                }))
                            ]}
                            onChange={(val) =>
                                setFormData({ ...formData, parent_id: String(val ?? "") })
                            }
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" isLoading={createCategoryMutation.isPending}>
                            Thêm danh mục
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
