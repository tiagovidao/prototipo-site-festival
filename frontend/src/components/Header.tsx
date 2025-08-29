import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  path: string;
}

interface HeaderProps {
  menuItems: MenuItem[];
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ 
  menuItems, 
  isMenuOpen, 
  setIsMenuOpen 
}) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <Link 
            to="/" 
            className="font-serif text-2xl md:text-3xl cursor-pointer"
          >
            Festival <span className="text-purple-700">Cultural</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-2">
            {menuItems.map(item => (
              <Link 
                key={item.id} 
                to={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-purple-700 text-white' 
                    : 'text-purple-700 hover:bg-purple-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="lg:hidden p-2 text-purple-700" 
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;