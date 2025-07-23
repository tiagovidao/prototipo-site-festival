import React from 'react';
import { X } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
}

interface MenuItemProps {
  menuItems: MenuItem[];
  currentPage: string;
  navigateTo: (page: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  menuItems, 
  currentPage, 
  navigateTo, 
  isMenuOpen, 
  setIsMenuOpen 
}) => {
  if (!isMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setIsMenuOpen(false)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <nav 
        className="fixed top-0 left-0 h-full w-full max-w-xs bg-stone-50 dark:bg-stone-900 shadow-xl z-50 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <span className="font-serif text-2xl">Menu</span>
          <button 
            onClick={() => setIsMenuOpen(false)} 
            className="p-2 text-stone-600 dark:text-stone-300" 
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mt-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`block w-full text-left py-3 px-4 rounded-md transition-colors ${
                currentPage === item.id 
                  ? 'bg-amber-700 text-white font-semibold' 
                  : 'text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MenuItem;