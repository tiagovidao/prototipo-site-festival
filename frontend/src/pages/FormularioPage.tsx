// frontend/src/pages/FormularioPage.tsx - Validação apenas no submit
import React, { useState, useCallback } from 'react';
import ApiService from '../services/api';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard 
} from 'lucide-react';

// Tipos
type FormDataType = {
  nome: string;
  documento: string;
  email: string;
  celular: string;
  dataNascimento: string;
};

interface Event {
  id: string;
  title: string;
  instructor: string;
  price: string;
}

interface FormularioProps {
  selectedEvents: string[];
  availableEvents: Event[];
  formData: FormDataType;
  setFormData: (data: FormDataType) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

// Hook para validação de CPF
const useCPFValidation = () => {
  const formatCPF = useCallback((value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d+)/, '$1.$2');
    if (numbers.length <= 9) return numbers.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
  }, []);

  const validateCPF = useCallback((cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  }, []);

  const handleCPFChange = (value: string, setFormData: (data: FormDataType) => void, formData: FormDataType) => {
    const formattedValue = formatCPF(value);
    setFormData({ ...formData, documento: formattedValue });
  };

  return { validateCPF, handleCPFChange };
};

// Componente principal
const Formulario: React.FC<FormularioProps> = ({
  selectedEvents,
  availableEvents,
  formData,
  setFormData,
  handleFormSubmit,
  onBack,
  isSubmitting
}) => {
  const { validateCPF, handleCPFChange } = useCPFValidation();
  const [isValidating, setIsValidating] = useState(false);

  // Formatar celular
  const formatCelular = useCallback((value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return numbers.replace(/(\d{2})(\d+)/, '($1) $2');
    if (numbers.length === 11) return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    return numbers.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  }, []);

  // Validar email
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Handler para celular
  const handleCelularChange = useCallback((value: string) => {
    const formattedValue = formatCelular(value);
    setFormData({ ...formData, celular: formattedValue });
  }, [formatCelular, formData, setFormData]);

  // Handler para email
  const handleEmailChange = useCallback((value: string) => {
    setFormData({ ...formData, email: value });
  }, [formData, setFormData]);

  // Validação completa do formulário
  const validateForm = (): { isValid: boolean; message?: string } => {
    // Verificar campos obrigatórios
    const requiredFields = ['nome', 'documento', 'email', 'celular', 'dataNascimento'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.trim());
    
    if (missingFields.length > 0) {
      return { isValid: false, message: 'Por favor, preencha todos os campos obrigatórios.' };
    }

    // Validar CPF
    if (!validateCPF(formData.documento)) {
      return { isValid: false, message: 'Por favor, insira um CPF válido (11 dígitos).' };
    }

    // Validar email
    if (!validateEmail(formData.email)) {
      return { isValid: false, message: 'Por favor, insira um email válido.' };
    }

    // Verificar se há eventos selecionados
    if (selectedEvents.length === 0) {
      return { isValid: false, message: 'Por favor, selecione pelo menos um evento.' };
    }

    return { isValid: true };
  };

  // Validar duplicatas na API
  const validateDuplicates = async (): Promise<{ isValid: boolean; message?: string }> => {
    try {
      const result = await ApiService.validateRegistrationData(formData.documento, formData.email);
      
      if (!result.isValid) {
        const conflictMessages = result.conflicts.map(conflict => {
          return conflict.type === 'documento' 
            ? 'Este CPF já foi utilizado em outra inscrição' 
            : 'Este e-mail já foi utilizado em outra inscrição';
        });
        
        return { 
          isValid: false, 
          message: `Não é possível continuar:\n\n${conflictMessages.join('\n')}\n\nPor favor, verifique seus dados ou entre em contato conosco.`
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Erro na validação de duplicatas:', error);
      // Em caso de erro na validação, permitir continuar (fail-safe)
      return { isValid: true };
    }
  };

  // Handler do submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Primeira validação: campos básicos
    const basicValidation = validateForm();
    if (!basicValidation.isValid) {
      alert(basicValidation.message);
      return;
    }

    // Segunda validação: duplicatas na API
    setIsValidating(true);
    
    const duplicateValidation = await validateDuplicates();
    setIsValidating(false);
    
    if (!duplicateValidation.isValid) {
      alert(duplicateValidation.message);
      return;
    }
    
    // Se chegou até aqui, tudo está válido
    handleFormSubmit(e);
  }, [formData, selectedEvents, handleFormSubmit, validateCPF, validateEmail]);

  // Calcular total
  const total = selectedEvents.reduce((sum, eventId) => {
    const event = availableEvents.find(e => e.id === eventId);
    return sum + (event ? parseFloat(event.price.replace('R$ ', '').replace(',', '.')) : 0);
  }, 0);

  // Verificar se o formulário básico está preenchido (para habilitar/desabilitar botão)
  const isFormFilled = Object.values(formData).every(value => value.trim()) && selectedEvents.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-purple-700 hover:text-purple-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos eventos
        </button>
        
        <h1 className="font-serif text-4xl md:text-5xl mb-4 text-center">
          Formulário de Inscrição
        </h1>
        
        <div className="w-24 h-1 bg-purple-600 mx-auto mb-8"></div>
      </div>

      {/* Resumo dos eventos selecionados */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold text-xl mb-4 text-stone-900 dark:text-stone-100 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
          Resumo da Inscrição
        </h3>
        
        <div className="space-y-3">
          {selectedEvents.map((eventId, index) => {
            const event = availableEvents.find(e => e.id === eventId);
            return (
              <div key={eventId} className="flex justify-between items-center py-2">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full text-sm flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{event?.title}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400">{event?.instructor}</p>
                  </div>
                </div>
                <span className="font-bold text-purple-700 dark:text-purple-400">{event?.price}</span>
              </div>
            );
          })}
          
          <div className="border-t border-purple-300 dark:border-purple-700 pt-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">Total:</span>
              <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          {/* Nome */}
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Nome completo *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800 transition-all"
              placeholder="Digite seu nome completo"
              required
            />
          </div>

          {/* CPF e Data de Nascimento */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                CPF *
              </label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => handleCPFChange(e.target.value, setFormData, formData)}
                className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800 transition-all"
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Data de Nascimento *
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800 transition-all"
                required
              />
            </div>
          </div>

          {/* Email e Celular */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800 transition-all"
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Celular *
              </label>
              <input
                type="tel"
                value={formData.celular}
                onChange={(e) => handleCelularChange(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800 transition-all"
                placeholder="(11) 99999-9999"
                maxLength={15}
                required
              />
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <button 
            type="button" 
            onClick={onBack}
            className="flex-1 flex items-center justify-center px-6 py-4 border border-stone-300 dark:border-stone-600 rounded-lg transition-all hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Eventos
          </button>
          
          <button 
            type="submit"
            disabled={isSubmitting || !isFormFilled || isValidating}
            className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg transition-all font-medium ${
              isSubmitting || !isFormFilled || isValidating
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-400 mr-2"></div>
                Validando...
              </>
            ) : (
              <>
                Continuar para Pagamento
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Formulario;