// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '../services/api';
// import { Order } from '../types';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Table from '../components/ui/Table';
// import Modal from '../components/ui/Modal';

// const Orders: React.FC = () => {
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const queryClient = useQueryClient();

//   const { data: orders, isLoading } = useQuery({
//     queryKey: ['orders'],
//     queryFn: api.getOrders,
//   });

  // const updateOrderStatusMutation = useMutation({
  //   mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
  //     api.updateOrderStatus(id, status),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['orders'] });
  //   },
  // });

//   // const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
//   //   updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
//   // };

//   const handleViewOrder = (order: Order) => {
//     setSelectedOrder(order);
//     setIsModalOpen(true);
//   };

//   const getStatusColor = (status: Order['status']) => {
//     switch (status) {
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'processing':
//         return 'bg-blue-100 text-blue-800';
//       case 'shipped':
//         return 'bg-purple-100 text-purple-800';
//       case 'delivered':
//         return 'bg-green-100 text-green-800';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const columns = [
//     {
//       key: 'id',
//       title: 'Order ID',
//       render: (value: string) => (
//         <span className="font-mono text-sm text-primary-600">#{value}</span>
//       ),
//     },
//     {
//       key: 'order_code',
//       title: 'Code',
//       render: (value: string, item: Order) => (
//         <div>
//           <p className="font-medium text-gray-900">{value}</p>
//         </div>
//       ),
//     },
//     {
//       key: 'customer_address_id',
//       title: 'Shipping address',
//       render: (value: Order['orderdetails']) => (
//         <span className="text-sm text-gray-600">
//           {value.length} item{value.length !== 1 ? 's' : ''}
//         </span>
//       ),
//     },
//     {
//       key: 'user_id',
//       title: 'user_id',
//       render: (value: number) => (
//         <span className="font-medium text-gray-900">${value}</span>
//       ),
//     },
//     {
//       key: 'status',
//       title: 'Status',
//       render: (value: Order['status']) => (
//         <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
//           {value.charAt(0).toUpperCase() + value.slice(1)}
//         </span>
//       ),
//     },
//     {
//       key: 'actions',
//       title: 'Actions',
//       render: (value: any, item: Order) => (
//         <div className="flex items-center space-x-2">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => handleViewOrder(item)}
//           >
//             View
//           </Button>
//           {item.status === 'pending' && (
//             <Button
//               size="sm"
//               // onClick={() => handleStatusChange(item.id, 'processing')}
//               // isLoading={updateOrderStatusMutation.isPending}
//             >
//               Process
//             </Button>
//           )}
//           {item.status === 'processing' && (
//             <Button
//               size="sm"
//               // onClick={() => handleStatusChange(item.id, 'shipped')}
//               // isLoading={updateOrderStatusMutation.isPending}
//             >
//               Ship
//             </Button>
//           )}
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
//           <p className="text-gray-600">Manage customer orders and fulfillment</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <Button variant="outline">Export Orders</Button>
//           <Button>Filter Orders</Button>
//         </div>
//       </div>

//       {/* Orders Table */}
//       <Card>
//         <Table
//           data={orders || []}
//           columns={columns}
//           loading={isLoading}
//           emptyMessage="No orders found"
//         />
//       </Card>

//       {/* Order Details Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setSelectedOrder(null);
//         }}
//         title={`Order #${selectedOrder?.id}`}
//         size="lg"
//       >
//         {selectedOrder && (
//           <div className="space-y-6">
//             {/* Order Info */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
//                 <div className="space-y-1 text-sm">
//                   {/* <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p> */}
//                   {/* <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p> */}
//                 </div>
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
//                 <div className="space-y-1 text-sm">
//                   <p><span className="font-medium">Status:</span> 
//                     <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
//                       {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
//                     </span>
//                   </p>
//                   {/* <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p> */}
//                 </div>
//               </div>
//             </div>

//             {/* Shipping Address */}
//             <div>
//               <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
//               <div className="text-sm text-gray-600">
//                 {/* <p>{selectedOrder.shippingAddress.street}</p> */}
//                 {/* <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p> */}
//                 {/* <p>{selectedOrder.shippingAddress.country}</p> */}
//               </div>
//             </div>

//             {/* Order Items */}
//             <div>
//               <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
//               <div className="space-y-2">
//                 {selectedOrder.orderdetails.map((item, index) => (
//                   <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                     <div>
//                       {/* <p className="font-medium text-gray-900">{item.productName}</p> */}
//                       <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
//                     </div>
//                     <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Total */}
//             <div className="border-t pt-4">
//               <div className="flex justify-between items-center">
//                 <span className="text-lg font-medium text-gray-900">Total</span>
//                 {/* <span className="text-xl font-bold text-gray-900">${selectedOrder.total.toFixed(2)}</span> */}
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex justify-end space-x-3 pt-4">
//               <Button
//                 variant="secondary"
//                 onClick={() => {
//                   setIsModalOpen(false);
//                   setSelectedOrder(null);
//                 }}
//               >
//                 Close
//               </Button>
//               {selectedOrder.status === 'pending' && (
//                 <Button
//                   onClick={() => {
//                     // handleStatusChange(selectedOrder.id, 'processing');
//                     setIsModalOpen(false);
//                     setSelectedOrder(null);
//                   }}
//                   // isLoading={updateOrderStatusMutation.isPending}
//                 >
//                   Process Order
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default Orders;

// import React, { useState } from 'react';
const Orders: React.FC = () => {
  return <>
  </>
}
export default Orders