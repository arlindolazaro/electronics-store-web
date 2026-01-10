import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-primary-600">
                Ecommerce Management
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Bell size={20} />
            </button>
            
            <div className="relative group">
              <div className="flex items-center space-x-2">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name || user?.displayName || user?.email}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Array.isArray(user?.roles) ? user.roles.join(', ') : (user as any)?.role}
                  </span>
                </div>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  {(
                    (user as any)?.avatar || (user as any)?.avatarUrl || (user as any).image || (user as any).photo
                  ) ? (
                    <img src={(user as any).avatar || (user as any).avatarUrl || (user as any).image || (user as any).photo} alt="avatar" className="w-8 h-8 object-cover" />
                  ) : (
                    <User size={16} className="text-primary-600" />
                  )}
                </div>
              </div>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                <Link
                  to="/perfil"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={14} className="mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;  