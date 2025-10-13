import React from 'react';
import CategoryTree, { CategoryNode } from '../components/ui/CategoryTree2';
import TableServerPagination from '../components/ui/TableServerPagination';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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
                <TableServerPagination
                    columns={[
                        { key: 'id', title: 'ID', sortable: true, width: '80px', align: 'center' },
                        { key: 'name', title: 'Name', sortable: true },
                        { key: 'age', title: 'Age', sortable: true },
                        {
                            key: 'actions',
                            title: 'Actions',
                            align: 'right',
                            render: (_, item) => <Button onClick={() => alert(`Clicked row: ${item.name}`)}>View</Button>
                        }
                    ]}
                    serverPagination={true}
                    fetchData={fetchServerData}
                    pageSize={10}
                    defaultSort={{ key: 'id', order: 'asc' }}
                // onRowClick={item => alert(`Clicked row: ${item.name}`)}
                />
            </Card>


        </div>
    );
}

export default Test;