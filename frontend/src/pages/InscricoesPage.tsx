// frontend/src/pages/InscricoesPage.tsx - Versão otimizada
import React from 'react';
import { Check, Clock, MapPin } from 'lucide-react';

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
  currentRegistrations?: number;
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
  // Estatísticas para exibir
  const totalSelectedEvents = selectedEvents.length;
  const totalPrice = selectedEvents.reduce((total, eventId) => {
    const event = availableEvents.find(e => e.id === eventId);
    return total + (event ? parseFloat(event.price.replace('R$ ', '').replace(',', '.')) : 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center pb-6 border-b border-stone-200 dark:border-stone-700">
        Eventos de Ballet Disponíveis
      </h1>
      
      {/* Status do carregamento */}
      {availableEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-32 mx-auto"></div>
          </div>
          <p className="mt-4 text-stone-600 dark:text-stone-400">
            Carregando eventos disponíveis...
          </p>
        </div>
      ) : (
        <>
          {/* Grid de eventos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {availableEvents.map(event => {
              const isSelected = selectedEvents.includes(event.id);
              const isAvailable = event.available && event.vacancies > 0;
              
              return (
                <div
                  key={event.id}
                  className={`border rounded-lg p-6 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-lg transform scale-[1.02]'
                      : isAvailable
                        ? 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md hover:transform hover:scale-[1.01]'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 opacity-70 cursor-not-allowed'
                  }`}
                  onClick={() => isAvailable && handleEventSelection(event.id)}
                >
                  {/* Header do card */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-stone-900 dark:text-stone-100 leading-tight">
                        {event.title}
                      </h3>
                      <p className="text-purple-700 dark:text-purple-400 font-medium">
                        {event.instructor}
                      </p>
                    </div>
                    
                    {/* Checkbox de seleção */}
                    <div 
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ml-3 flex-shrink-0 ${
                        isSelected ? 'border-purple-600 bg-purple-600' : 'border-stone-400'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  
                  {/* Informações do evento */}
                  <div className="space-y-3 mt-6 text-stone-700 dark:text-stone-300">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-stone-500" />
                      <div className="flex-1">
                        <div className="font-medium">{event.date}</div>
                        <div className="text-sm opacity-75">{event.time}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-3 text-stone-500" />
                      <span>{event.location}</span>
                    </div>
                    
                  </div>
                  
                  {/* Preço e status */}
                  <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                        {event.price}
                      </span>
                      
                      {event.vacancies === 0 ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full text-sm font-medium">
                          ESGOTADO
                        </span>
                      ) : event.vacancies <= 2 ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-full text-sm font-medium">
                          ÚLTIMAS VAGAS
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
                          DISPONÍVEL
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo da seleção */}
          {totalSelectedEvents > 0 && (
            <div className="bg-white dark:bg-stone-800 rounded-lg border border-purple-200 dark:border-purple-800 p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
                    {totalSelectedEvents} evento{totalSelectedEvents > 1 ? 's' : ''} selecionado{totalSelectedEvents > 1 ? 's' : ''}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400">
                    Total: <span className="font-bold text-purple-700 dark:text-purple-400">
                      {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </p>
                </div>
                
                <button 
                  onClick={onContinue}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3 rounded-md transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105 font-medium"
                >
                  Continuar Inscrição
                </button>
              </div>
            </div>
          )}

          {/* Mensagem quando nenhum evento está selecionado */}
          {totalSelectedEvents === 0 && (
            <div className="text-center py-8">
              <div className="text-stone-400 dark:text-stone-600 mb-4">
                <Check className="w-12 h-12 mx-auto mb-2" />
              </div>
              <p className="text-lg text-stone-600 dark:text-stone-400 mb-2">
                Selecione os eventos que deseja participar
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-500">
                Você pode escolher quantos eventos quiser clicando nos cards acima
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Inscricoes;