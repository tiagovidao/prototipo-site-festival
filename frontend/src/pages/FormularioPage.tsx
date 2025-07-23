import React from 'react';

interface Event {
  id: string;
  title: string;
  price: string;
}

interface FormularioProps {
  selectedEvents: string[];
  availableEvents: Event[];
  formData: {
    nome: string;
    documento: string;
    email: string;
    celular: string;
    dataNascimento: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    nome: string;
    documento: string;
    email: string;
    celular: string;
    dataNascimento: string;
  }>>;
  handleFormSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const Formulario: React.FC<FormularioProps> = ({
  selectedEvents,
  availableEvents,
  formData,
  setFormData,
  handleFormSubmit,
  onBack
}) => {
  // Calculate total price
  const total = selectedEvents.reduce((total, eventId) => {
    const event = availableEvents.find(e => e.id === eventId);
    return total + (event ? parseFloat(event.price.replace('R$ ', '').replace(',', '.')) : 0);
  }, 0).toFixed(2).replace('.', ',');
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center pb-6 border-b border-stone-200 dark:border-stone-700">
        Formulário de Inscrição
      </h1>
      
      <div className="p-6 rounded-lg mb-8 border border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10">
        <h3 className="font-semibold text-lg mb-3 text-stone-900 dark:text-stone-100">
          Eventos selecionados:
        </h3>
        <ul className="text-stone-700 dark:text-stone-300 space-y-2">
          {selectedEvents.map(eventId => {
            const event = availableEvents.find(e => e.id === eventId);
            return (
              <li key={eventId} className="flex justify-between">
                <span>• {event?.title}</span>
                <span className="font-medium">{event?.price}</span>
              </li>
            );
          })}
          <li className="flex justify-between mt-3 pt-3 border-t border-stone-300 dark:border-stone-600">
            <span className="font-bold">Total:</span>
            <span className="font-bold">R$ {total}</span>
          </li>
        </ul>
      </div>
      
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
            Nome completo *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-stone-800"
            required
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Documento (RG/CPF) *
            </label>
            <input
              type="text"
              value={formData.documento}
              onChange={(e) => setFormData({...formData, documento: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-stone-800"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Data de Nascimento *
            </label>
            <input
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-stone-800"
              required
            />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-stone-800"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Celular *
            </label>
            <input
              type="tel"
              value={formData.celular}
              onChange={(e) => setFormData({...formData, celular: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-stone-800"
              required
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            type="button" 
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-stone-300 dark:border-stone-600 rounded-md transition-colors bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600"
          >
            Voltar
          </button>
          <button 
            type="submit"
            className="flex-1 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-md transition-colors"
          >
            Finalizar Inscrição
          </button>
        </div>
      </form>
    </div>
  );
};

export default Formulario;