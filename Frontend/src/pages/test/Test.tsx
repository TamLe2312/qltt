import React from 'react';
import CategoryTree, { CategoryNode } from '../../components/features/categories/CategoryTree';
import Card from '../../components/ui/data-display/Card';
import TableServerPagination from '../../components/ui/data-display/TableServerPagination';
import Button from '../../components/ui/form/Button';
import TableDemo from './TableDemo';
const Test: React.FC = () => {

    const sample: CategoryNode[] = [
        {
            id: 1, name: 'Electronics', children: [
                { id: 4, name: 'Laptops', children: [{ id: 10, name: 'Gaming Laptops', children: [] }] },
                { id: 5, name: 'Phones', children: [{ id: 11, name: 'Smartphones', children: [] }] }
            ]
        },
        { id: 2, name: 'Clothing', children: [{ id: 6, name: 'Men', children: [] }, { id: 7, name: 'Women', children: [] }] },
        { id: 3, name: 'Home & Kitchen', children: [{ id: 8, name: 'Furniture', children: [] }, { id: 9, name: 'Appliances', children: [] }] }
    ];

    // Giả lập API server-side
    const fetchServerData = async ({
        page,
        pageSize,
        sortKey,
        sortOrder,
    }: {
        page: number;
        pageSize: number;
        sortKey?: string;
        sortOrder?: 'asc' | 'desc';
    }) => {
        // Giả lập dữ liệu lớn
        const total = 100;
        let data = Array.from({ length: total }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
            age: 20 + (i % 30),
        }));

        // Sort
        if (sortKey) {
            data.sort((a, b) => {
                const va = (a as any)[sortKey];
                const vb = (b as any)[sortKey];
                if (va < vb) return sortOrder === 'asc' ? -1 : 1;
                if (va > vb) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // Slice page
        const start = (page - 1) * pageSize;
        const paginated = data.slice(start, start + pageSize);

        // Trả về kết quả giống API thật
        return new Promise<{ total: number; data: typeof paginated }>(resolve => {
            setTimeout(() => resolve({ total, data: paginated }), 500); // giả lập delay 500ms
        });
    };


    return (
        <div>
            <Card className='mb-3'>
                <CategoryTree tree={sample} />
            </Card>

            <Card>
                <TableDemo />
            </Card>


        </div>
    );
}

export default Test;