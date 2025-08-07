// frontend/src/components/InscricoesFlow.tsx
import React, { useEffect } from 'react';
import { useInscricoes } from '../hooks/useInscricoes';
import Inscricoes from '../pages/InscricoesPage';
import Formulario from '../pages/FormularioPage';
import PaymentForm from './PaymentForm';
import PaymentSuccess from '../pages/PaymentSuccessPage';
import ApiService from '../services/api';
import { type PaymentData } from '../types';

interface InscricoesFlowProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type FlowStep = 'loading' | 'events' | 'form' | 'payment' | 'success' | 'error';

const InscricoesFlow: React.FC<InscricoesFlowProps> = ({ onCancel }) => {
  // Hook customizado para gerenciar estado das inscrições
  const {
    availableEvents,
    selectedEvents,
    formData,
    loadingState,
    apiError,
    loadEvents,
    selectEvent,
    deselectEvent,
    updateFormData,
    resetInscricoes,
    calculateTotal,
    isEventSelected
  } = useInscricoes();

  // Estado local do fluxo
  const [currentStep, setCurrentStep] = React.useState<FlowStep>('loading');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [paymentData, setPaymentData] = React.useState<PaymentData | null>(null);

  // Carregar eventos quando o componente é montado
  useEffect(() => {
    const initializeFlow = async () => {
      console.log('🎭 Inicializando fluxo de inscrições...');
      await loadEvents();
    };

    initializeFlow();
  }, [loadEvents]);

  // Atualizar step baseado no loading state
  useEffect(() => {
    if (loadingState === 'loading') {
      setCurrentStep('loading');
    } else if (loadingState === 'success' || loadingState === 'error') {
      setCurrentStep('events');
    }
  }, [loadingState]);

  // Handlers do fluxo
  const handleEventSelection = (eventId: string) => {
    if (isEventSelected(eventId)) {
      deselectEvent(eventId);
    } else {
      selectEvent(eventId);
    }
  };

  const handleContinueToForm = () => {
    if (selectedEvents.length === 0) {
      alert('Por favor, selecione pelo menos um evento.');
      return;
    }
    setCurrentStep('form');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    const requiredFields = ['nome', 'documento', 'email', 'celular', 'dataNascimento'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (selectedEvents.length === 0) {
      alert('Por favor, selecione pelo menos um evento.');
      return;
    }

    // Avançar para pagamento
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async (paymentInfo: PaymentData) => {
    try {
      setIsSubmitting(true);

      const totalAmount = calculateTotal();

      // Criar inscrição após pagamento aprovado
      await ApiService.createRegistration({
        ...formData,
        selectedEvents,
        totalAmount,
        paymentId: paymentInfo.payment_id,
        paymentStatus: paymentInfo.status
      });

      setPaymentData(paymentInfo);
      setCurrentStep('success');

    } catch (error) {
      console.error('Erro ao finalizar inscrição:', error);
      alert(`Erro ao finalizar inscrição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRegistration = () => {
    resetInscricoes();
    setPaymentData(null);
    setCurrentStep('events');
  };

  const handleCancel = () => {
    resetInscricoes();
    setPaymentData(null);
    onCancel();
  };

  // Render do banner de erro da API se necessário
  const ErrorBanner = apiError && (
    <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            {apiError}
          </p>
        </div>
      </div>
    </div>
  );

  // Render baseado no step atual
  const renderStep = () => {
    switch (currentStep) {
      case 'loading':
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-lg">Carregando eventos...</p>
              <button 
                onClick={handleCancel}
                className="mt-4 text-sm text-stone-600 dark:text-stone-400 hover:text-purple-600 transition-colors underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4">Erro ao Carregar Eventos</h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6">{apiError}</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => loadEvents()}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-md transition-colors"
                >
                  Tentar Novamente
                </button>
                <button 
                  onClick={handleCancel}
                  className="bg-stone-300 hover:bg-stone-400 text-stone-700 px-6 py-3 rounded-md transition-colors"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <>
            {ErrorBanner}
            <Inscricoes 
              availableEvents={availableEvents}
              selectedEvents={selectedEvents}
              handleEventSelection={handleEventSelection}
              onContinue={handleContinueToForm}
            />
          </>
        );

      case 'form':
        return (
          <>
            {ErrorBanner}
            <Formulario 
              selectedEvents={selectedEvents}
              availableEvents={availableEvents}
              formData={formData}
              setFormData={updateFormData}
              handleFormSubmit={handleFormSubmit}
              onBack={() => setCurrentStep('events')}
              isSubmitting={isSubmitting}
            />
          </>
        );

      case 'payment':
        return (
          <>
            {ErrorBanner}
            <PaymentForm 
              selectedEvents={selectedEvents}
              availableEvents={availableEvents}
              formData={formData}
              onPaymentSuccess={handlePaymentSuccess}
              onBack={() => setCurrentStep('form')}
              totalAmount={calculateTotal()}
            />
          </>
        );

      case 'success':
        return (
          <>
            {ErrorBanner}
            <PaymentSuccess 
              paymentData={paymentData}
              selectedEvents={selectedEvents}
              availableEvents={availableEvents}
              formData={formData}
              onNewRegistration={handleNewRegistration}
            />
          </>
        );

      default:
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg">Estado inválido do fluxo</p>
              <button 
                onClick={handleCancel}
                className="mt-4 bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-md transition-colors"
              >
                Voltar ao início
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {renderStep()}
    </div>
  );
};

export default InscricoesFlow;