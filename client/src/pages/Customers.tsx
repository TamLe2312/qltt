import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Customer } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';

const Customers: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: api.getCustomers,
  });

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: Customer['status']) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'avatar',
      title: 'Avatar',
      render: (value: string, item: Customer) => (
        <div className="flex items-center">
          {item.avatar ? (
            <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {item.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      title: 'Customer',
      sortable: true,
      sortAccessor: (item: Customer) => item.name.toLowerCase(),
      render: (value: string, item: Customer) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      sortable: true,
      sortAccessor: (item: Customer) => item.phone || '',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'totalOrders',
      title: 'Orders',
      sortable: true,
      sortAccessor: (item: Customer) => item.totalOrders,
      render: (value: number) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'totalSpent',
      title: 'Total Spent',
      sortable: true,
      sortAccessor: (item: Customer) => item.totalSpent,
      render: (value: number) => (
        <span className="font-medium text-gray-900">${value.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      sortAccessor: (item: Customer) => item.status,
      render: (value: Customer['status']) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Joined',
      sortable: true,
      sortAccessor: (item: Customer) => new Date(item.createdAt),
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, item: Customer) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewCustomer(item)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer base</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">Export Customers</Button>
          <Button>Add Customer</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers?.filter(c => c.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers?.reduce((sum, c) => sum + c.totalOrders, 0) || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${customers?.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString() || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <Table
          data={(customers || [])}
          columns={columns}
          loading={isLoading}
          emptyMessage="No customers found"
          defaultSort={{ key: 'name', order: 'asc' }}
          getRowKey={(c) => c.id}
        />
      </Card>

      {/* Customer Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        title={`Customer Details`}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="flex items-center space-x-4">
              {selectedCustomer.avatar ? (
                <img 
                  src={selectedCustomer.avatar} 
                  alt={selectedCustomer.name} 
                  className="w-16 h-16 rounded-full" 
                />
              ) : (
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-medium text-primary-700">
                    {selectedCustomer.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                <p className="text-gray-600">{selectedCustomer.email}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                  {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{selectedCustomer.totalOrders}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${selectedCustomer.totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(selectedCustomer.createdAt).getFullYear()}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Email:</span> {selectedCustomer.email}</p>
                <p><span className="font-medium">Phone:</span> {selectedCustomer.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedCustomer(null);
                }}
              >
                Close
              </Button>
              <Button variant="outline">
                Send Email
              </Button>
              <Button>
                View Orders
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
