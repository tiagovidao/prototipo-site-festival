import React from 'react';
import { Mail, Phone, MapPin, FileText, Calendar, Check } from 'lucide-react';

interface FooterProps {
  navigateTo: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ navigateTo }) => {
  return (
    <footer className="py-16 border-t border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-2xl mb-4">
              Festival <span className="text-purple-700 dark:text-purple-500">Cultural</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-400">
              Cras in feugiat nisi, ac vehicula libero. Aenean nec orci sed metus imperdiet gravida sed et nisl.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4 text-stone-800 dark:text-stone-200">Contato</h4>
            <div className="space-y-4 text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-purple-600 dark:text-purple-500" />
                <span>contato@festivalcultural.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-purple-600 dark:text-purple-500" />
                <span>(12) 3456-7890</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-purple-600 dark:text-purple-500" />
                <span>Brasília, DF</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4 text-stone-800 dark:text-stone-200">Links Rápidos</h4>
            <div className="space-y-3">
              <button 
                onClick={() => navigateTo('inscricoes')} 
                className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-purple-700 dark:hover:text-purple-500 transition-colors"
              >
                <FileText size={16} />
                <span>Inscrições</span>
              </button>
              <button 
                onClick={() => navigateTo('edicoes')} 
                className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-purple-700 dark:hover:text-purple-500 transition-colors"
              >
                <Calendar size={16} />
                <span>Edições Anteriores</span>
              </button>
              <button 
                onClick={() => navigateTo('doacoes')} 
                className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-purple-700 dark:hover:text-purple-500 transition-colors"
              >
                <Check size={16} />
                <span>Doações</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-stone-200 dark:border-stone-700 mt-12 pt-8 text-center text-stone-500 dark:text-stone-500 text-sm">
          © 2025 Festival Cultural. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
