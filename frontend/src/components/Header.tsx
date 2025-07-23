import React from 'react';
import { Menu, X } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
}

interface HeaderProps {
  menuItems: MenuItem[];
  currentPage: string;
  navigateTo: (page: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ 
  menuItems, 
  currentPage, 
  navigateTo, 
  isMenuOpen, 
  setIsMenuOpen 
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          <div 
            className="font-serif text-2xl md:text-3xl cursor-pointer" 
            onClick={() => navigateTo('home')}
          >
            Festival <span className="text-amber-700 dark:text-amber-500">Cultural</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-2">
            {menuItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => navigateTo(item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === item.id 
                    ? 'bg-amber-700 text-white' 
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="lg:hidden p-2 text-stone-600 dark:text-stone-300" 
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