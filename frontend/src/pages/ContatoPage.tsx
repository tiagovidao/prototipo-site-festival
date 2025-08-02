import React from 'react';

interface ContatoProps {
  contactForm: {
    nome: string;
    email: string;
    telefone: string;
    cidade: string;
    escola: string;
    mensagem: string;
  };
  setContactForm: React.Dispatch<React.SetStateAction<{
    nome: string;
    email: string;
    telefone: string;
    cidade: string;
    escola: string;
    mensagem: string;
  }>>;
  handleContactSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const Contato: React.FC<ContatoProps> = ({ 
  contactForm, 
  setContactForm, 
  handleContactSubmit,
  isSubmitting
}) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center pb-6 border-b border-stone-200 dark:border-stone-700">
        Entre em Contato
      </h1>
      
      <form onSubmit={handleContactSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
            Nome *
          </label>
          <input
            type="text"
            value={contactForm.nome}
            onChange={(e) => setContactForm({...contactForm, nome: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
            required
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Email
            </label>
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Telefone
            </label>
            <input
              type="tel"
              value={contactForm.telefone}
              onChange={(e) => setContactForm({...contactForm, telefone: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Cidade
            </label>
            <input
              type="text"
              value={contactForm.cidade}
              onChange={(e) => setContactForm({...contactForm, cidade: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Instituição/Escola
            </label>
            <input
              type="text"
              value={contactForm.escola}
              onChange={(e) => setContactForm({...contactForm, escola: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
            />
          </div>
        </div>
        
        <div>
          <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
            Mensagem *
          </label>
          <textarea
            value={contactForm.mensagem}
            onChange={(e) => setContactForm({...contactForm, mensagem: e.target.value})}
            rows={5}
            className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-stone-800"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full bg-purple-700 hover:bg-purple-800 text-white px-6 py-4 rounded-md transition-colors ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
      </form>
    </div>
  );
};

export default Contato;