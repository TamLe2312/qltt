import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Analytics: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.getDashboardStats,
  });

  const { data: revenueChart, isLoading: chartLoading } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: api.getRevenueChart,
  });

  const analyticsData = [
    {
      title: 'Revenue Growth',
      value: `${stats?.revenueGrowth}%`,
      change: '+5.2%',
      changeType: 'positive' as const,
      description: 'Compared to last month',
    },
    {
      title: 'Order Growth',
      value: `${stats?.ordersGrowth}%`,
      change: '+12.1%',
      changeType: 'positive' as const,
      description: 'Compared to last month',
    },
    {
      title: 'Customer Growth',
      value: `${stats?.customersGrowth}%`,
      change: '+8.7%',
      changeType: 'positive' as const,
      description: 'Compared to last month',
    },
    {
      title: 'Product Growth',
      value: `${stats?.productsGrowth}%`,
      change: '+3.4%',
      changeType: 'positive' as const,
      description: 'Compared to last month',
    },
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 45, revenue: 44955 },
    { name: 'MacBook Pro M3', sales: 23, revenue: 45977 },
    { name: 'AirPods Pro', sales: 67, revenue: 13400 },
    { name: 'iPad Air', sales: 34, revenue: 20400 },
    { name: 'Apple Watch', sales: 28, revenue: 11200 },
  ];

  const recentActivity = [
    { action: 'New order received', time: '2 minutes ago', type: 'order' },
    { action: 'Product updated', time: '15 minutes ago', type: 'product' },
    { action: 'Customer registered', time: '1 hour ago', type: 'customer' },
    { action: 'Order shipped', time: '2 hours ago', type: 'order' },
    { action: 'Product added', time: '3 hours ago', type: 'product' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Insights and performance metrics for your store</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">Export Report</Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((item, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card title="Revenue Overview" subtitle="Monthly revenue trends">
          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Revenue Chart</p>
                <p className="text-sm">Integration with Chart.js or similar library</p>
              </div>
            </div>
          )}
        </Card>

        {/* Top Products */}
        <Card title="Top Products" subtitle="Best performing products this month">
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="Recent Activity" subtitle="Latest activities in your store">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'order' ? 'bg-green-400' :
                  activity.type === 'product' ? 'bg-blue-400' :
                  'bg-purple-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card title="Performance Metrics" subtitle="Key performance indicators">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
              <span className="text-sm font-bold text-gray-900">3.2%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: '32%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Average Order Value</span>
              <span className="text-sm font-bold text-gray-900">$127.50</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
              <span className="text-sm font-bold text-gray-900">4.8/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '96%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Return Rate</span>
              <span className="text-sm font-bold text-gray-900">2.1%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: '21%' }}></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
