// frontend/src/pages/FormularioPage.tsx - Reescrito com validação
import React, { useState, useCallback, useEffect } from 'react';
import ApiService from '../services/api';
import { 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  AlertTriangle 
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

// Hook para validação de duplicatas
const useRegistrationValidation = () => {
  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    conflicts: { type: 'documento' | 'email'; value: string }[];
    message: string;
  }>({ 
    isValidating: false, 
    isValid: null, 
    conflicts: [],
    message: '' 
  });

  const validateRegistration = useCallback(async (documento: string, email: string) => {
    if (!documento.trim() || !email.trim()) {
      setValidationState({
        isValidating: false,
        isValid: null,
        conflicts: [],
        message: ''
      });
      return;
    }

    setValidationState(prev => ({
      ...prev,
      isValidating: true,
      message: 'Verificando se os dados já foram utilizados...'
    }));

    try {
      const result = await ApiService.validateRegistrationData(documento, email);
      
      if (result.isValid) {
        setValidationState({
          isValidating: false,
          isValid: true,
          conflicts: [],
          message: '✅ Dados disponíveis para inscrição'
        });
      } else {
        const conflictMessages = result.conflicts.map(conflict => {
          return `${conflict.type === 'documento' ? 'CPF' : 'E-mail'} já utilizado`;
        });
        
        setValidationState({
          isValidating: false,
          isValid: false,
          conflicts: result.conflicts,
          message: `❌ ${conflictMessages.join(' e ')}`
        });
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      setValidationState({
        isValidating: false,
        isValid: null,
        conflicts: [],
        message: '⚠️ Não foi possível validar os dados. Você pode continuar.'
      });
    }
  }, []);

  return { validationState, validateRegistration };
};

// Hook para validação de CPF
const useCPFValidation = () => {
  const [validation, setValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });

  const formatCPF = useCallback((value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d+)/, '$1.$2');
    if (numbers.length <= 9) return numbers.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
  }, []);

  const validateCPF = useCallback((cpf: string): { isValid: boolean; message: string } => {
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length === 0) return { isValid: false, message: '' };
    if (numbers.length < 11) return { isValid: false, message: 'CPF deve ter 11 dígitos' };
    
    return { isValid: true, message: 'CPF válido' };
  }, []);

  const handleCPFChange = (value: string, setFormData: (data: FormDataType) => void, formData: FormDataType) => {
    const formattedValue = formatCPF(value);
    setFormData({ ...formData, documento: formattedValue });
    const validationResult = validateCPF(formattedValue);
    setValidation(validationResult);
  };

  return { validation, handleCPFChange };
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
  const { validation: cpfValidation, handleCPFChange } = useCPFValidation();
  const { validationState, validateRegistration } = useRegistrationValidation();
  const [emailValidation, setEmailValidation] = useState<boolean | null>(null);
  const [hasTriedValidation, setHasTriedValidation] = useState(false);

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

  // Trigger de validação com debounce
  useEffect(() => {
    if (cpfValidation.isValid && emailValidation === true && formData.documento && formData.email) {
      const timeoutId = setTimeout(() => {
        validateRegistration(formData.documento, formData.email);
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [cpfValidation.isValid, emailValidation, formData.documento, formData.email, validateRegistration]);

  // Handlers
  const handleCelularChange = useCallback((value: string) => {
    const formattedValue = formatCelular(value);
    setFormData({ ...formData, celular: formattedValue });
  }, [formatCelular, formData, setFormData]);

  const handleEmailChange = useCallback((value: string) => {
    setFormData({ ...formData, email: value });
    if (value) {
      setEmailValidation(validateEmail(value));
    } else {
      setEmailValidation(null);
    }
  }, [formData, setFormData, validateEmail]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setHasTriedValidation(true);
    
    // Validações básicas
    if (!cpfValidation.isValid) {
      alert('Por favor, insira um CPF válido.');
      return;
    }

    if (emailValidation === false) {
      alert('Por favor, insira um email válido.');
      return;
    }

    const requiredFields = ['nome', 'documento', 'email', 'celular', 'dataNascimento'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.trim());
    
    if (missingFields.length > 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de duplicatas
    if (validationState.isValid === false) {
      const conflictMessages = validationState.conflicts.map(conflict => {
        return conflict.type === 'documento' 
          ? 'Este CPF já foi utilizado em outra inscrição' 
          : 'Este e-mail já foi utilizado em outra inscrição';
      });
      
      alert(`❌ Não é possível continuar:\n\n${conflictMessages.join('\n')}\n\nPor favor, verifique seus dados ou entre em contato conosco.`);
      return;
    }

    if (validationState.isValidating) {
      alert('Aguarde a validação dos seus dados...');
      return;
    }
    
    handleFormSubmit(e);
  }, [cpfValidation, emailValidation, formData, handleFormSubmit, validationState]);

  // Calcular total
  const total = selectedEvents.reduce((sum, eventId) => {
    const event = availableEvents.find(e => e.id === eventId);
    return sum + (event ? parseFloat(event.price.replace('R$ ', '').replace(',', '.')) : 0);
  }, 0);

  // Verificar se o formulário está válido
  const isFormValid = cpfValidation.isValid && 
    emailValidation !== false && 
    Object.values(formData).every(value => value.trim()) &&
    validationState.isValid !== false &&
    !validationState.isValidating;

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
              <div className="relative">
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => handleCPFChange(e.target.value, setFormData, formData)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-stone-800 pr-10 transition-all ${
                    cpfValidation.isValid === null
                      ? 'border-stone-300 dark:border-stone-600 focus:ring-purple-500'
                      : cpfValidation.isValid
                      ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
                      : 'border-red-300 dark:border-red-600 focus:ring-red-500'
                  }`}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
                
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {cpfValidation.isValid === true && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {cpfValidation.isValid === false && cpfValidation.message && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              
              {cpfValidation.message && (
                <p className={`mt-2 text-sm ${
                  cpfValidation.isValid 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {cpfValidation.message}
                </p>
              )}
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
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-stone-800 pr-10 transition-all ${
                    emailValidation === null
                      ? 'border-stone-300 dark:border-stone-600 focus:ring-purple-500'
                      : emailValidation
                      ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
                      : 'border-red-300 dark:border-red-600 focus:ring-red-500'
                  }`}
                  placeholder="seu.email@exemplo.com"
                  required
                />
                
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {emailValidation === true && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {emailValidation === false && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              
              {emailValidation === false && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Email inválido
                </p>
              )}
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

        {/* Status da validação de duplicatas */}
        {(validationState.isValidating || validationState.message) && (
          <div className={`p-4 rounded-lg border ${
            validationState.isValidating
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : validationState.isValid === true
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : validationState.isValid === false
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-center">
              {validationState.isValidating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              ) : validationState.isValid === true ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              ) : validationState.isValid === false ? (
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              )}
              
              <div>
                <p className={`font-medium ${
                  validationState.isValidating
                    ? 'text-blue-700 dark:text-blue-300'
                    : validationState.isValid === true
                    ? 'text-green-700 dark:text-green-300'
                    : validationState.isValid === false
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  {validationState.message}
                </p>
                
                {validationState.isValid === false && validationState.conflicts.length > 0 && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    <p>Se você já se inscreveu antes, entre em contato conosco.</p>
                    <p>Se estes dados estão sendo usados por outra pessoa, verifique as informações.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
            disabled={isSubmitting || !isFormValid || validationState.isValidating}
            className={`flex-1 flex items-center justify-center px-6 py-4 rounded-lg transition-all font-medium ${
              isSubmitting || !isFormValid || validationState.isValidating
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : validationState.isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-400 mr-2"></div>
                Validando dados...
              </>
            ) : (
              <>
                Continuar para Pagamento
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Indicador de validação do formulário */}
        {!isFormValid && hasTriedValidation && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                  Verifique os dados preenchidos
                </p>
                <ul className="text-yellow-600 dark:text-yellow-400 text-sm mt-1 space-y-1">
                  {!formData.nome.trim() && <li>• Nome é obrigatório</li>}
                  {!cpfValidation.isValid && <li>• CPF deve ser válido</li>}
                  {!formData.email.trim() && <li>• Email é obrigatório</li>}
                  {emailValidation === false && <li>• Email deve ser válido</li>}
                  {!formData.celular.trim() && <li>• Celular é obrigatório</li>}
                  {!formData.dataNascimento && <li>• Data de nascimento é obrigatória</li>}
                  {validationState.isValid === false && <li>• Dados já utilizados em outra inscrição</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Formulario;