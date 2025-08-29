import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, FileText, Calendar } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-16 border-t border-stone-200 bg-stone-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-serif text-2xl mb-4">
              Festival <span className="text-purple-700">Cultural</span>
            </h3>
            <p className="text-stone-600">
              Cras in feugiat nisi, ac vehicula libero. Aenean nec orci sed metus imperdiet gravida sed et nisl.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4 text-stone-800">Contato</h4>
            <div className="space-y-4 text-stone-600">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-purple-600" />
                <span>contato@festivalcultural.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-purple-600" />
                <span>(12) 3456-7890</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-purple-600" />
                <span>Brasília, DF</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4 text-stone-800">Links Rápidos</h4>
            <div className="space-y-3">
              <Link 
                to="/inscricoes" 
                className="flex items-center gap-3 text-stone-600 hover:text-purple-700 transition-colors"
              >
                <FileText size={16} />
                <span>Inscrições</span>
              </Link>
              <Link 
                to="/edicoes" 
                className="flex items-center gap-3 text-stone-600 hover:text-purple-700 transition-colors"
              >
                <Calendar size={16} />
                <span>Edições Anteriores</span>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-stone-200 mt-12 pt-8 text-center text-stone-500 text-sm">
          © 2025 Festival Cultural. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;