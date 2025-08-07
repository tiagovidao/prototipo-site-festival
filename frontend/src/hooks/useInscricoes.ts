// frontend/src/hooks/useInscricoes.ts
import { useState, useCallback } from 'react';
import ApiService from '../services/api';
import { type Event, type FormData, type LoadingState } from '../types';

interface UseInscricoesReturn {
  // Estados
  availableEvents: Event[];
  selectedEvents: string[];
  formData: FormData;
  loadingState: LoadingState;
  apiError: string;
  
  // Actions
  loadEvents: () => Promise<void>;
  selectEvent: (eventId: string) => void;
  deselectEvent: (eventId: string) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetInscricoes: () => void;
  calculateTotal: () => number;
  
  // Utilities
  isEventSelected: (eventId: string) => boolean;
  getSelectedEventsDetails: () => Event[];
}

const INITIAL_FORM_DATA: FormData = {
  nome: '',
  documento: '',
  email: '',
  celular: '',
  dataNascimento: ''
};

// Dados fallback para quando a API não estiver disponível
const FALLBACK_EVENTS: Event[] = [
  { 
    id: 'e1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', 
    title: 'BALLET CLÁSSICO JÚNIOR', 
    instructor: 'CLÁUDIA ZACCARI', 
    date: '25/08/2025', 
    time: '13:30 às 15:00h', 
    location: 'SALA 01', 
    price: 'R$ 15,00', 
    available: true, 
    vacancies: 3, 
    totalVacancies: 7,
    currentRegistrations: 4
  },
  { 
    id: 'f2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7', 
    title: 'BALLET CLÁSSICO PRÉ', 
    instructor: 'CARIDAD MARTINEZ', 
    date: '25/08/2025', 
    time: '15:00 às 16:30h', 
    location: 'SALA 01', 
    price: 'R$ 15,00', 
    available: true, 
    vacancies: 5, 
    totalVacancies: 7,
    currentRegistrations: 2
  },
  { 
    id: 'g3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8', 
    title: 'BALLET CONTEMPORÂNEO', 
    instructor: 'FELIPE SILVA', 
    date: '26/08/2025', 
    time: '10:00 às 12:00h', 
    location: 'SALA 02', 
    price: 'R$ 12,00', 
    available: true, 
    vacancies: 6, 
    totalVacancies: 7,
    currentRegistrations: 1
  },
  { 
    id: 'h4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9', 
    title: 'BALLET AVANÇADO', 
    instructor: 'AMANDA COSTA', 
    date: '27/08/2025', 
    time: '14:00 às 16:00h', 
    location: 'SALA 03', 
    price: 'R$ 18,00', 
    available: true, 
    vacancies: 4, 
    totalVacancies: 7,
    currentRegistrations: 3
  },
  { 
    id: 'i5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0', 
    title: 'BALLET INFANTIL', 
    instructor: 'RAFAEL SANTOS', 
    date: '28/08/2025', 
    time: '16:30 às 18:30h', 
    location: 'SALA 01', 
    price: 'R$ 10,00', 
    available: true, 
    vacancies: 7, 
    totalVacancies: 7,
    currentRegistrations: 0
  },
  { 
    id: 'j6f7g8h9-i0j1-k2l3-m4n5-o6p7q8r9s0t1', 
    title: 'BALLET INICIANTE', 
    instructor: 'JULIANA OLIVEIRA', 
    date: '29/08/2025', 
    time: '09:00 às 11:00h', 
    location: 'SALA 04', 
    price: 'R$ 20,00', 
    available: true, 
    vacancies: 2, 
    totalVacancies: 7,
    currentRegistrations: 5
  }
];

export const useInscricoes = (): UseInscricoesReturn => {
  // Estados locais do hook
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [apiError, setApiError] = useState<string>('');

  // Função para carregar eventos (chamada sob demanda)
  const loadEvents = useCallback(async () => {
    // Evitar múltiplas chamadas desnecessárias
    if (loadingState === 'loading' || availableEvents.length > 0) {
      return;
    }

    try {
      setLoadingState('loading');
      setApiError('');
      
      console.log('🎭 Carregando eventos para inscrições...');
      const events = await ApiService.getEvents();
      
      setAvailableEvents(events);
      setLoadingState('success');
      console.log(`✅ ${events.length} eventos carregados com sucesso`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setApiError(`Erro ao carregar eventos: ${errorMessage}. Usando dados em cache.`);
      
      // Usar dados fallback
      setAvailableEvents(FALLBACK_EVENTS);
      setLoadingState('error');
      
      console.log('🔄 Usando eventos fallback devido ao erro');
    }
  }, [loadingState, availableEvents.length]);

  // Funções de seleção de eventos
  const selectEvent = useCallback((eventId: string) => {
    const event = availableEvents.find(e => e.id === eventId);
    
    // Verificar se o evento existe e está disponível
    if (!event || !event.available || event.vacancies <= 0) {
      console.warn('⚠️ Tentativa de selecionar evento indisponível:', eventId);
      return;
    }
    
    // Evitar duplicatas
    if (selectedEvents.includes(eventId)) {
      return;
    }
    
    setSelectedEvents(prev => [...prev, eventId]);
    console.log('✅ Evento selecionado:', event.title);
  }, [availableEvents, selectedEvents]);

  const deselectEvent = useCallback((eventId: string) => {
    setSelectedEvents(prev => prev.filter(id => id !== eventId));
    
    const event = availableEvents.find(e => e.id === eventId);
    console.log('❌ Evento removido da seleção:', event?.title);
  }, [availableEvents]);

  // Função para atualizar dados do formulário
  const updateFormData = useCallback((data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  // Função para resetar todo o estado das inscrições
  const resetInscricoes = useCallback(() => {
    setSelectedEvents([]);
    setFormData(INITIAL_FORM_DATA);
    // Não resetar availableEvents para evitar recarregamento desnecessário
    console.log('🔄 Estado das inscrições resetado');
  }, []);

  // Função para calcular o total
  const calculateTotal = useCallback((): number => {
    return selectedEvents.reduce((total, eventId) => {
      const event = availableEvents.find(e => e.id === eventId);
      const price = event ? parseFloat(event.price.replace('R$ ', '').replace(',', '.')) : 0;
      return total + price;
    }, 0);
  }, [selectedEvents, availableEvents]);

  // Utilities
  const isEventSelected = useCallback((eventId: string): boolean => {
    return selectedEvents.includes(eventId);
  }, [selectedEvents]);

  const getSelectedEventsDetails = useCallback((): Event[] => {
    return selectedEvents
      .map(eventId => availableEvents.find(e => e.id === eventId))
      .filter((event): event is Event => event !== undefined);
  }, [selectedEvents, availableEvents]);

  return {
    // Estados
    availableEvents,
    selectedEvents,
    formData,
    loadingState,
    apiError,
    
    // Actions
    loadEvents,
    selectEvent,
    deselectEvent,
    updateFormData,
    resetInscricoes,
    calculateTotal,
    
    // Utilities
    isEventSelected,
    getSelectedEventsDetails
  };
};