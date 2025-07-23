import React from 'react';
import { Check } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  location: string;
  price: string;
  available: boolean;
  vacancies: number;
  totalVacancies: number;
}

interface InscricoesProps {
  availableEvents: Event[];
  selectedEvents: string[];
  handleEventSelection: (eventId: string) => void;
  onContinue: () => void;
}

const Inscricoes: React.FC<InscricoesProps> = ({ 
  availableEvents, 
  selectedEvents, 
  handleEventSelection,
  onContinue
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center pb-6 border-b border-stone-200 dark:border-stone-700">
        Eventos de Ballet Disponíveis
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {availableEvents.map(event => {
          const isSelected = selectedEvents.includes(event.id);
          const isAvailable = event.available && event.vacancies > 0;
          
          return (
            <div
              key={event.id}
              className={`border rounded-lg p-6 transition-all duration-300 ${
                isSelected
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                  : isAvailable
                    ? 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-stone-400 dark:hover:border-stone-500 hover:shadow-md'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 opacity-70'
              } ${!isAvailable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => isAvailable && handleEventSelection(event.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-stone-900 dark:text-stone-100">
                    {event.title}
                  </h3>
                  <p className="text-purple-700 dark:text-purple-400 font-medium">
                    {event.instructor}
                  </p>
                </div>
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-purple-600 bg-purple-600' : 'border-stone-400'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              
              <div className="space-y-3 mt-6 text-stone-700 dark:text-stone-300">
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span>{event.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horário:</span>
                  <span>{event.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local:</span>
                  <span>{event.location}</span>
                </div>
                <div className="flex justify-between font-bold mt-4 text-stone-800 dark:text-stone-100">
                  <span>Valor:</span>
                  <span>{event.price}</span>
                </div>
              </div>
              
              {event.vacancies === 0 && (
                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                  <div className="text-center font-bold text-red-600 dark:text-red-500">
                    ESGOTADO
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedEvents.length > 0 && (
        <div className="text-center">
          <button 
            onClick={onContinue}
            className="bg-purple-700 hover:bg-purple-800 text-white px-10 py-4 rounded-md transition-colors duration-300"
          >
            Continuar Inscrição ({selectedEvents.length} evento{selectedEvents.length > 1 ? 's' : ''})
          </button>
        </div>
      )}
    </div>
  );
};

export default Inscricoes;
