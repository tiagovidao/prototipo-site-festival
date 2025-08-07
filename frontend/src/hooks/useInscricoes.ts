// frontend/src/hooks/useInscricoes.ts - Simplificado sem validação em tempo real
import { useState, useCallback } from 'react';
import ApiService from '../services/api';
import { type Event, type FormData, type LoadingState } from '../types';

export interface UseInscricoesState {
  availableEvents: Event[];
  selectedEvents: string[];
  formData: FormData;
  loadingState: LoadingState;
  apiError: string;
}

export const useInscricoes = () => {
  // Estado principal
  const [state, setState] = useState<UseInscricoesState>({
    availableEvents: [],
    selectedEvents: [],
    formData: {
      nome: '',
      documento: '',
      email: '',
      celular: '',
      dataNascimento: ''
    },
    loadingState: 'idle',
    apiError: ''
  });

  // Carregar eventos
  const loadEvents = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loadingState: 'loading',
      apiError: ''
    }));

    try {
      console.log('🎭 Carregando eventos...');
      const events = await ApiService.getEvents();
      
      setState(prev => ({
        ...prev,
        availableEvents: events || [],
        loadingState: 'success'
      }));
      
      console.log('✅ Eventos carregados:', events?.length || 0);
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao carregar eventos. Verifique sua conexão e tente novamente.';
        
      setState(prev => ({
        ...prev,
        loadingState: 'error',
        apiError: errorMessage
      }));
    }
  }, []);

  // Selecionar evento
  const selectEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      selectedEvents: [...prev.selectedEvents, eventId]
    }));
  }, []);

  // Desselecionar evento
  const deselectEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      selectedEvents: prev.selectedEvents.filter(id => id !== eventId)
    }));
  }, []);

  // Atualizar dados do formulário
  const updateFormData = useCallback((data: FormData) => {
    setState(prev => ({
      ...prev,
      formData: data
    }));
  }, []);

  // Reset completo
  const resetInscricoes = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedEvents: [],
      formData: {
        nome: '',
        documento: '',
        email: '',
        celular: '',
        dataNascimento: ''
      },
      apiError: ''
    }));
  }, []);

  // Calcular total
  const calculateTotal = useCallback((): number => {
    return state.selectedEvents.reduce((total, eventId) => {
      const event = state.availableEvents.find(e => e.id === eventId);
      return total + (event ? parseFloat(event.price.replace('R$ ', '').replace(',', '.')) : 0);
    }, 0);
  }, [state.selectedEvents, state.availableEvents]);

  // Verificar se evento está selecionado
  const isEventSelected = useCallback((eventId: string): boolean => {
    return state.selectedEvents.includes(eventId);
  }, [state.selectedEvents]);

  // Obter detalhes dos eventos selecionados
  const getSelectedEventsDetails = useCallback((): Event[] => {
    return state.selectedEvents
      .map(eventId => state.availableEvents.find(e => e.id === eventId))
      .filter((event): event is Event => event !== undefined);
  }, [state.selectedEvents, state.availableEvents]);

  // Validar se pode prosseguir para o pagamento
  const canProceedToPayment = useCallback((): boolean => {
    const hasSelectedEvents = state.selectedEvents.length > 0;
    const hasValidFormData = Object.values(state.formData).every(value => value.trim());
    return hasSelectedEvents && hasValidFormData;
  }, [state.selectedEvents, state.formData]);

  return {
    // Estado
    availableEvents: state.availableEvents,
    selectedEvents: state.selectedEvents,
    formData: state.formData,
    loadingState: state.loadingState,
    apiError: state.apiError,
    
    // Ações
    loadEvents,
    selectEvent,
    deselectEvent,
    updateFormData,
    resetInscricoes,
    
    // Utilitários
    calculateTotal,
    isEventSelected,
    getSelectedEventsDetails,
    canProceedToPayment
  };
};