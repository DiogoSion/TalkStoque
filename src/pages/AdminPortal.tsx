import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ClipboardList,
  BarChart3,
  DollarSign,
  Boxes,
  UserCheck,
  Clock
} from 'lucide-react';
import Inventory from './Inventory';
import Employers from './Employers';
import Orders from './Orders';
import Sales from './Sales';

// Quick Stats Data
const quickStats = [
  { id: 1, name: 'Total Revenue', value: '$12,345', change: '+12%', icon: DollarSign },
  { id: 2, name: 'Active Orders', value: '25', change: '+5%', icon: ClipboardList },
  { id: 3, name: 'Products in Stock', value: '1,234', change: '-2%', icon: Boxes },
  { id: 4, name: 'Active Employees', value: '12', change: '0%', icon: UserCheck }
];

// Recent Activity Data
const recentActivity = [
  { id: 1, action: 'New order received', time: '5 minutes ago', status: 'pending' },
  { id: 2, action: 'Stock updated: Cola Classic', time: '15 minutes ago', status: 'completed' },
  { id: 3, action: 'New employee added', time: '1 hour ago', status: 'completed' },
  { id: 4, action: 'Sales report generated', time: '2 hours ago', status: 'completed' }
];

// Dashboard Component
const Dashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
    
    {/* Quick Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className={`mt-2 text-sm ${
                  stat.change.startsWith('+') ? 'text-green-600' : stat.change === '0%' ? 'text-gray-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Quick Actions and Recent Activity Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/admin/inventory"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Package className="h-6 w-6 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Manage Inventory</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <ClipboardList className="h-6 w-6 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">View Orders</span>
          </Link>
          <Link
            to="/admin/sales"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <ShoppingCart className="h-6 w-6 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Sales Report</span>
          </Link>
          <Link
            to="/admin/employers"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Users className="h-6 w-6 text-orange-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Manage Staff</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Analytics = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
    <div className="bg-white p-6 rounded-lg shadow-md">
      <p className="text-gray-600">Analytics features coming soon...</p>
    </div>
  </div>
);

function AdminPortal() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: TrendingUp },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Sales', href: '/admin/sales', icon: ShoppingCart },
    { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { name: 'Employers', href: '/admin/employers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex flex-col h-screen">
            <div className="flex items-center justify-center h-16 px-4">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TalkStoque</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <Icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/employers" element={<Employers />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;