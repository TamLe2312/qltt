import React, { useState, useMemo, FC } from 'react';

export interface CategoryNode {
    id: number;
    name: string;
    children?: CategoryNode[];
}

export interface CategoryTreeProps {
    tree: CategoryNode[];
    className?: string;
}

const CategoryTree: FC<CategoryTreeProps> = ({ tree = [], className = '' }) => {
    // State đóng mở
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    // State tìm kiếm
    const [query, setQuery] = useState('');
    // State truyền cho breadcrumb
    const [activePath, setActivePath] = useState<number[]>([]);

    // Toggle mở/đóng node
    const toggle = (id: number) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Chuyển cây → danh sách phẳng (phục vụ search và breadcrumb)
    const flatten = (nodes: CategoryNode[], parent: { id: number; name: string }[] = []): { id: number; name: string; path: { id: number; name: string }[] }[] => {
        let out: { id: number; name: string; path: { id: number; name: string }[] }[] = [];
        for (const n of nodes) {
            const path = [...parent, { id: n.id, name: n.name }];
            out.push({ id: n.id, name: n.name, path });
            if (n.children && n.children.length) out = out.concat(flatten(n.children, path));
        }
        return out;
    };

    const flat = useMemo(() => flatten(tree, []), [tree]);

    // Tìm kiếm node theo tên, trả về Set các id cần highlight + expand
    const matches = useMemo(() => {
        if (!query.trim()) return new Set<number>();
        const q = query.toLowerCase();
        const matchedIds = new Set<number>();
        for (const item of flat) {
            if (item.name.toLowerCase().includes(q)) {
                for (const p of item.path) matchedIds.add(p.id);
            }
        }
        return matchedIds;
    }, [query, flat]);

    // Khi user click chọn node → mở rộng các node cha và set breadcrumb
    const onSelect = (node: CategoryNode | null, path: { id: number; name: string }[]) => {
        setActivePath(path.map(p => p.id));
        setExpanded(prev => {
            const next = new Set(prev);
            for (const p of path) next.add(p.id);
            return next;
        });
    };

    // Hiển thị breadcrumb
    const Breadcrumbs: FC<{ path: number[] }> = ({ path }) => {
        if (!path || !path.length) return null;
        return (
            <nav className="flex items-center text-sm text-gray-600 space-x-2 px-2">
                {path.map((p, idx) => {
                    const item = flat.find(f => f.id === p);
                    return (
                        <span key={p} className="flex items-center">
                            <button
                                onClick={() => onSelect(null, path.slice(0, idx + 1).map(id => ({ id, name: flat.find(f => f.id === id)?.name || String(id) })))}
                                className="hover:underline focus:outline-none"
                            >
                                {item?.name || p}
                            </button>
                            {idx < path.length - 1 && <span className="mx-2">/</span>}
                        </span>
                    );
                })}
            </nav>
        );
    };

    // Node con hiển thị đệ quy
    const TreeNode: FC<{ node: CategoryNode; depth?: number }> = ({ node, depth = 0 }) => {
        const isExpanded = expanded.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const isMatched = matches.size ? matches.has(node.id) : false;
        const isActive = activePath.includes(node.id);

        const nodePath = flat.find(f => f.id === node.id)?.path || [{ id: node.id, name: node.name }];

        return (
            <div>
                <div
                    className={`flex items-center space-x-2 py-1 px-2 mb-1 rounded-md cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    style={{ paddingLeft: depth * 12 + 8 }}
                    onClick={(e) => { e.stopPropagation(); onSelect(node, nodePath); }}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); toggle(node.id); }}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            <svg className={`w-4 h-4 transform ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : (
                        <div style={{ width: 24 }} />
                    )}

                    <div className="flex-1 min-w-0">
                        <div className={`truncate ${isMatched ? 'font-semibold text-blue-600' : 'text-gray-800'}`}>
                            {node.name}
                        </div>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {node.children!.map(child => (
                            <TreeNode key={child.id} node={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Render chính
    return (
        <div className={`mx-auto ${className}`}>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header + Search */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Category Tree</h3>
                    <div className="flex items-center space-x-2">
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search categories..."
                            className="border rounded px-3 py-1 text-sm focus:ring focus:ring-blue-200"
                        />
                        <button
                            onClick={() => { setExpanded(new Set()); setActivePath([]); setQuery(''); }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="px-2 py-2">
                    <Breadcrumbs path={activePath} />
                </div>

                {/* Tree hiển thị */}
                <div className="px-2 py-2 max-h-[60vh] overflow-auto">
                    {tree.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No categories</div>
                    ) : (
                        tree.map(node => <TreeNode key={node.id} node={node} depth={0} />)
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryTree;

// Dữ liệu mẫu để test
// [
//     {
//         id: 1,
//         name: "Electronics",
//         children: [
//             { id: 2, name: "Phones" },
//             {
//                 id: 3,
//                 name: "Computers",
//                 children: [
//                     { id: 4, name: "Laptops" },
//                     { id: 5, name: "Desktops" },
//                 ],
//             },
//         ],
//     },
//     {
//         id: 6,
//         name: "Clothing",
//         children: [
//             { id: 7, name: "Men" },
//             { id: 8, name: "Women" },
//         ],
//     },
// ];

// Dạng của flat
// [
//   { id: 1, name: "Electronics", path: [{id:1,name:"Electronics"}] },
//   { id: 2, name: "Phones", path: [{id:1,name:"Electronics"},{id:2,name:"Phones"}] },
//   { id: 3, name: "Computers", path: [{id:1,name:"Electronics"},{id:3,name:"Computers"}] },
//   { id: 4, name: "Laptops", path: [{id:1,name:"Electronics"},{id:3,name:"Computers"},{id:4,name:"Laptops"}] },
//   { id: 5, name: "Desktops", path: [{id:1,name:"Electronics"},{id:3,name:"Computers"},{id:5,name:"Desktops"}] },
//   { id: 6, name: "Clothing", path: [{id:6,name:"Clothing"}] },
//   { id: 7, name: "Men", path: [{id:6,name:"Clothing"},{id:7,name:"Men"}] },
//   { id: 8, name: "Women", path: [{id:6,name:"Clothing"},{id:8,name:"Women"}] },
// ]
