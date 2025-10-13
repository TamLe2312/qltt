import { useQuery } from "@tanstack/react-query";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import DropdownSelect from "../../components/ui/DropdownSelect";
import { api } from "../../services/api";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  parent_name: string | null;
}

interface TableCategoryProps {
  data: Category[] | [];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: Category) => void;
  className?: string;
}

const TableCategory: React.FC<TableCategoryProps> = ({
  data,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  className = "",
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Parent Name
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr
              key={item.id}
              className={`hover:bg-gray-50 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
              onClick={() => onRowClick?.(item)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm">{item.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {item.parent_name || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Categories: React.FC = () => {
  // Lấy dữ liệu từ ClientQuery
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: api.getCategories,
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className={"flex items-center justify-between"}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage your categories</p>
          </div>
          <Button>Export Report</Button>
        </div>

        {/* Categories Table */}
        <Card>
          <TableCategory
            data={categories?.data || []}
            loading={isLoading}
            emptyMessage="No categories found"
          />
        </Card>
        <Card>
          <DropdownSelect
            data={categories?.data || []}
            value="1"
            valueKey="id"
            labelKey="name"
            // onChange={(val, item) => console.log(val, item)}
            placeholder="Choose category"
          />
        </Card>
      </div>
    </>
  );
};

export default Categories;
