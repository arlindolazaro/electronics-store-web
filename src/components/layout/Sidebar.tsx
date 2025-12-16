import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Package, ShoppingCart, ShoppingBag, 
  BarChart3, Users, CheckSquare, Settings, 
  ChevronLeft, ChevronRight, Archive, FileText 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  submenu?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();
  const { user } = useAuthStore();

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => {
      if (prev.includes(title)) return prev.filter((t) => t !== title);
      return [...prev, title];
    });
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: <Home size={20} />,
      path: '/dashboard',
    },
    {
      title: 'Produtos',
      icon: <Package size={20} />,
      path: '/produtos',
      submenu: [
        { title: 'Listar Produtos', icon: <Package size={16} />, path: '/produtos' },
        { title: 'Novo Produto', icon: <Package size={16} />, path: '/produtos/novo' },
      ],
    },
    {
      title: 'Vendas',
      icon: <ShoppingCart size={20} />,
      path: '/vendas',
      submenu: [
        { title: 'Listar Vendas', icon: <ShoppingCart size={16} />, path: '/vendas' },
        { title: 'Nova Venda', icon: <ShoppingCart size={16} />, path: '/vendas/nova' },
      ],
    },
    {
      title: 'Compras',
      icon: <ShoppingBag size={20} />,
      path: '/compras',
      submenu: [
        { title: 'Listar Compras', icon: <ShoppingBag size={16} />, path: '/compras' },
        { title: 'Nova Compra', icon: <ShoppingBag size={16} />, path: '/compras/nova' },
      ],
    },
    {
      title: 'Inventário',
      icon: <Archive size={20} />,
      path: '/inventario',
      roles: ['EMPLOYEE', 'ADMIN', 'OWNER'],
    },
    {
      title: 'Aprovações',
      icon: <CheckSquare size={20} />,
      path: '/aprovacoes',
      roles: ['OWNER', 'ADMIN'],
    },
    {
      title: 'Usuários',
      icon: <Users size={20} />,
      path: '/usuarios',
      roles: ['ADMIN'],
    },
    {
      title: 'Relatórios',
      icon: <BarChart3 size={20} />,
      path: '/relatorios',
      submenu: [
        { title: 'Vendas por Período', icon: <FileText size={16} />, path: '/relatorios/vendas' },
        { title: 'Status Inventário', icon: <FileText size={16} />, path: '/relatorios/inventario' },
        { title: 'Métricas', icon: <FileText size={16} />, path: '/relatorios/metricas' },
      ],
    },
    {
      title: 'Configurações',
      icon: <Settings size={20} />,
      path: '/perfil',
    },
  ];

  const hasPermission = (item: MenuItem) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || '');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className={`relative bg-white border-r border-gray-200 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col min-h-0`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="p-4 space-y-2 flex-1 overflow-auto min-h-0">
        {menuItems.filter(hasPermission).map((item) => {
          const hasSub = !!item.submenu && item.submenu.length > 0;
          const isOpen = openMenus.includes(item.title) || isActive(item.path);
          return (
            <div key={item.title}>
              {hasSub ? (
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg ${isActive(item.path) ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">{item.icon}</div>
                      {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </div>
                    {!isCollapsed && (
                      <div className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                        <ChevronRight size={16} />
                      </div>
                    )}
                  </button>

                  {!isCollapsed && isOpen && item.submenu!.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`flex items-center space-x-3 ml-6 p-2 rounded-lg text-sm ${isActive(subItem.path) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <div className="flex-shrink-0">{subItem.icon}</div>
                      <span>{subItem.title}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-2 rounded-lg ${isActive(item.path) ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* footer area placeholder (kept empty) */}
    </div>
  );
};

export default Sidebar;