// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '../services/api';
// import { Product } from '../types';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Table from '../components/ui/Table';
// import Modal from '../components/ui/Modal';
// import Input from '../components/ui/Input';

// const Products: React.FC = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     category: '',
//     stock: '',
//     image: '',
//   });

//   const queryClient = useQueryClient();

//   const { data: products, isLoading } = useQuery({
//     queryKey: ['products'],
//     queryFn: api.getProducts,
//   });

//   const createProductMutation = useMutation({
//     mutationFn: api.createProduct,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['products'] });
//       setIsModalOpen(false);
//       resetForm();
//     },
//   });

//   // const updateProductMutation = useMutation({
//   //   mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
//   //     api.updateProduct(id, updates),
//   //   onSuccess: () => {
//   //     queryClient.invalidateQueries({ queryKey: ['products'] });
//   //     setIsModalOpen(false);
//   //     resetForm();
//   //   },
//   // });

//   const deleteProductMutation = useMutation({
//     mutationFn: api.deleteProduct,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['products'] });
//     },
//   });

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       description: '',
//       price: '',
//       category: '',
//       stock: '',
//       image: '',
//     });
//     setEditingProduct(null);
//   };

//   const handleEdit = (product: Product) => {
//     setEditingProduct(product);
//     setFormData({
//       name: product.name,
//       description: product.description,
//       price: product.price.toString(),
//       category: product.category,
//       stock: product.stock.toString(),
//       image: product.image,
//     });
//     setIsModalOpen(true);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const productData = {
//       name: formData.name,
//       description: formData.description,
//       price: parseFloat(formData.price),
//       category: formData.category,
//       stock: parseInt(formData.stock),
//       image: formData.image,
//       status: 'active' as const,
//     };

//     if (editingProduct) {
//       // updateProductMutation.mutate({
//       //   id: editingProduct.id,
//       //   updates: productData,
//       // });
//     } else {
//       createProductMutation.mutate(productData);
//     }
//   };

//   const columns = [
//     {
//       key: 'image',
//       title: 'Image',
//       render: (value: string) => (
//         <img src={value} alt="Product" className="w-12 h-12 object-cover rounded-lg" />
//       ),
//     },
//     {
//       key: 'name',
//       title: 'Name',
//       render: (value: string, item: Product) => (
//         <div>
//           <p className="font-medium text-gray-900">{value}</p>
//           <p className="text-sm text-gray-500">{item.category}</p>
//         </div>
//       ),
//     },
//     {
//       key: 'price',
//       title: 'Price',
//       render: (value: number) => `$${value.toFixed(2)}`,
//     },
//     {
//       key: 'stock',
//       title: 'Stock',
//       render: (value: number) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//           value > 10 ? 'bg-green-100 text-green-800' : 
//           value > 0 ? 'bg-yellow-100 text-yellow-800' : 
//           'bg-red-100 text-red-800'
//         }`}>
//           {value} units
//         </span>
//       ),
//     },
//     {
//       key: 'status',
//       title: 'Status',
//       render: (value: string) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//           value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//         }`}>
//           {value}
//         </span>
//       ),
//     },
//     {
//       key: 'actions',
//       title: 'Actions',
//       render: (value: any, item: Product) => (
//         <div className="flex items-center space-x-2">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => handleEdit(item)}
//           >
//             Edit
//           </Button>
//           <Button
//             size="sm"
//             variant="danger"
//             onClick={() => deleteProductMutation.mutate(item.id)}
//             isLoading={deleteProductMutation.isPending}
//           >
//             Delete
//           </Button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Products</h1>
//           <p className="text-gray-600">Manage your product inventory</p>
//         </div>
//         <Button onClick={() => setIsModalOpen(true)}>
//           Add Product
//         </Button>
//       </div>

//       {/* Products Table */}
//       <Card>
//         <Table
//           data={products || []}
//           columns={columns}
//           loading={isLoading}
//           emptyMessage="No products found"
//         />
//       </Card>

//       {/* Add/Edit Product Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           resetForm();
//         }}
//         title={editingProduct ? 'Edit Product' : 'Add New Product'}
//         size="lg"
//       >
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Input
//               label="Product Name"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               required
//             />
//             <Input
//               label="Category"
//               value={formData.category}
//               onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//               required
//             />
//             <Input
//               label="Price"
//               type="number"
//               step="0.01"
//               value={formData.price}
//               onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//               required
//             />
//             <Input
//               label="Stock"
//               type="number"
//               value={formData.stock}
//               onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
//               required
//             />
//           </div>
          
//           <Input
//             label="Description"
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             required
//           />
          
//           <Input
//             label="Image URL"
//             value={formData.image}
//             onChange={(e) => setFormData({ ...formData, image: e.target.value })}
//             required
//           />

//           <div className="flex justify-end space-x-3 pt-4">
//             <Button
//               type="button"
//               variant="secondary"
//               onClick={() => {
//                 setIsModalOpen(false);
//                 resetForm();
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               // isLoading={createProductMutation.isPending || updateProductMutation.isPending}
//             >
//               {editingProduct ? 'Update Product' : 'Add Product'}
//             </Button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// };

// export default Products;

import React, { useState } from 'react';
const Products: React.FC = () => {
  return <>
  </>
}
export default Products