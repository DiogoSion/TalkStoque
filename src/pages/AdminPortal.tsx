import React, { useState, useEffect, ElementType } from 'react';
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
import { LucideProps } from 'lucide-react';
import axios from 'axios'; // Importa axios para type checking de erro
import apiClient from '../services/api';
import Inventory from './Inventory';
import Employers from './Employers';
import Orders from './Orders';
import Sales from './Sales';


interface DashboardStat {
  id: number;
  name: string;
  apiEndpoint: string;
  dataKey: string;
  icon: ElementType;
  unit?: string;
  originalChange: string;
  value: string;          // O valor buscado da API ou o status (Carregando..., Erro)
  change: string;         // O texto de 'change' para exibição (atualmente vindo de originalChange)
}

// Configuração para os Quick Stats com informações da API
// Endpoints ajustados para serem usados com o baseURL do apiClient
const quickStatsConfig: Array<Omit<DashboardStat, 'value' | 'change'>> = [
  {
    id: 1,
    name: 'Total Revenue',
    apiEndpoint: '/vendas/estatisticas/valor-total',
    dataKey: 'total',
    icon: DollarSign, // componentes de ícone
    unit: '$',
    originalChange: '+12%'
  },
  {
    id: 2,
    name: 'Active Orders',
    apiEndpoint: 'pedidos/contagem-ativos',
    dataKey: 'total_ativos',
    icon: ClipboardList,
    originalChange: '+5%'
  },
  {
    id: 3,
    name: 'Products in Stock',
    apiEndpoint: 'produtos/estoque/total',
    dataKey: 'total_itens_estoque',
    icon: Boxes,
    originalChange: '-2%'
  },
  {
    id: 4,
    name: 'Active Employees',
    apiEndpoint: '/funcionarios/total',
    dataKey: 'total_funcionarios',
    icon: UserCheck,
    originalChange: '0%'
  }
];

// Recent Activity Data (mock)
const recentActivity = [
  { id: 1, action: 'New order received', time: '5 minutes ago', status: 'pending' },
  { id: 2, action: 'Stock updated: Cola Classic', time: '15 minutes ago', status: 'completed' },
  { id: 3, action: 'New employee added', time: '1 hour ago', status: 'completed' },
  { id: 4, action: 'Sales report generated', time: '2 hours ago', status: 'completed' }
];

// Dashboard Component
const Dashboard = () => {
  // CORREÇÃO APLICADA AQUI: Tipo explícito para useState
  const [dashboardStats, setDashboardStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      try {
        const promises = quickStatsConfig.map(async (statConfigItem) => { // Renomeado para clareza
          try {
            const response = await apiClient.get(statConfigItem.apiEndpoint);
            const data = response.data;
            const value = data[statConfigItem.dataKey];

            // Monta o objeto que corresponde à interface DashboardStat
            const dashboardStatItem: DashboardStat = {
              ...statConfigItem, // Espalha as propriedades de statConfigItem
              value: `${statConfigItem.unit || ''}${value}`,
              change: statConfigItem.originalChange, // Define 'change'
            };
            return dashboardStatItem;

          } catch (error) {
            console.error(`Falha ao buscar dados para ${statConfigItem.name}:`, error);
            let errorMessage = 'Falha';
            if (axios.isAxiosError(error)) {
              if (error.response) {
                errorMessage = `Erro ${error.response.status}`;
              } else if (error.request) {
                errorMessage = 'Sem Resposta';
              }
            }
            // Retorna um objeto compatível com DashboardStat em caso de erro
            const errorStatItem: DashboardStat = {
              ...statConfigItem,
              value: errorMessage,
              change: statConfigItem.originalChange,
            };
            return errorStatItem;
          }
        });

        const results: DashboardStat[] = await Promise.all(promises); // results agora é explicitamente DashboardStat[]
        setDashboardStats(results);

      } catch (error) { // Este catch é para erros no Promise.all em si, se houver
        console.error("Erro ao buscar todas as estatísticas do dashboard (Promise.all):", error);
        // Mapeia quickStatsConfig para DashboardStat[] também em caso de erro geral
        setDashboardStats(quickStatsConfig.map(s => ({
          ...s,
          value: 'Erro Geral',
          change: s.originalChange, // Garante que 'change' está presente
        } as DashboardStat))); // Type assertion para garantir conformidade
      }
      setLoading(false);
    };

    fetchAllStats();
  }, []);

  // displayStats agora será inferido corretamente como DashboardStat[] ou o tipo do map de carregamento
  const displayStats: DashboardStat[] = loading
    ? quickStatsConfig.map(s => ({
      ...s,
      value: 'Carregando...',
      change: s.originalChange,
    } as DashboardStat)) // Type assertion para garantir conformidade
    : dashboardStats;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <p className={`mt-2 text-sm ${stat.change.startsWith('+') ? 'text-green-600' : stat.change === '0%' ? 'text-gray-600' : 'text-red-600'
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

      {/* Quick Actions and Recent Activity Grid (permanecem como antes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
};

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
                    className={`${location.pathname === item.href
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