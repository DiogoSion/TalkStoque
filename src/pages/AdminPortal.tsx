import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingCart, Users, TrendingUp, ClipboardList, BarChart3 } from 'lucide-react';
import Inventory from './Inventory';

// Admin Portal Components
const Dashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DashboardCard
        title="Inventory Management"
        description="Track and manage your beverage stock levels efficiently"
        icon={<Package className="h-6 w-6" />}
      />
      <DashboardCard
        title="Sales Analytics"
        description="Get detailed insights into your sales performance"
        icon={<BarChart3 className="h-6 w-6" />}
      />
      <DashboardCard
        title="Customer Management"
        description="Manage customer relationships and order history"
        icon={<Users className="h-6 w-6" />}
      />
    </div>
  </div>
);

const DashboardCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
        {icon}
      </div>
    </div>
  </div>
);

const Sales = () => <div>Sales Management</div>;
const Orders = () => <div>Orders Management</div>;
const Customers = () => <div>Customers Management</div>;
const Analytics = () => <div>Analytics Dashboard</div>;

function AdminPortal() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: TrendingUp },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Sales', href: '/admin/sales', icon: ShoppingCart },
    { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { name: 'Customers', href: '/admin/customers', icon: Users },
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
            <Route path="/customers" element={<Customers />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;