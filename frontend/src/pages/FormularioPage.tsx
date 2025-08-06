import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
  isSubmitting: boolean;
}

const Formulario: React.FC<FormularioProps> = ({
  selectedEvents,
  availableEvents,
  formData,
  setFormData,
  handleFormSubmit,
  onBack,
  isSubmitting
}) => {
  const [cpfValidation, setCpfValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });

  // Função para formatar CPF
  const formatCPF = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a formatação
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return limitedNumbers.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (limitedNumbers.length <= 9) {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
  };

  // Função para validar CPF
  const validateCPF = (cpf: string): { isValid: boolean; message: string } => {
    // Remove formatação
    const numbers = cpf.replace(/\D/g, '');
    
    // Verifica se está vazio
    if (numbers.length === 0) {
      return { isValid: false, message: '' };
    }
    
    // Verifica se tem menos de 11 dígitos
    if (numbers.length < 11) {
      return { isValid: false, message: 'CPF deve ter 11 dígitos' };
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numbers)) {
      return { isValid: false, message: 'CPF inválido - todos os dígitos são iguais' };
    }
    
    // Validação do algoritmo do CPF
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(9, 10))) {
      return { isValid: false, message: 'CPF inválido - primeiro dígito verificador incorreto' };
    }
    
    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.substring(10, 11))) {
      return { isValid: false, message: 'CPF inválido - segundo dígito verificador incorreto' };
    }
    
    return { isValid: true, message: 'CPF válido' };
  };

  // Handler para mudança no campo CPF
  const handleCPFChange = (value: string) => {
    const formattedValue = formatCPF(value);
    setFormData({ ...formData, documento: formattedValue });
    
    // Validar CPF em tempo real
    const validation = validateCPF(formattedValue);
    setCpfValidation(validation);
  };

  // Formatar celular
  const formatCelular = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a formatação
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return limitedNumbers.replace(/(\d{2})(\d+)/, '($1) $2');
    } else if (limitedNumbers.length <= 11) {
      // Formato: (11) 99999-9999 ou (11) 9999-9999
      if (limitedNumbers.length === 11) {
        return limitedNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else {
        return limitedNumbers.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
      }
    }
    
    return limitedNumbers;
  };

  // Handler para mudança no celular
  const handleCelularChange = (value: string) => {
    const formattedValue = formatCelular(value);
    setFormData({ ...formData, celular: formattedValue });
  };

  // Validar formulário antes do submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar CPF antes de submeter
    const cpfValidationResult = validateCPF(formData.documento);
    if (!cpfValidationResult.isValid) {
      setCpfValidation(cpfValidationResult);
      return;
    }
    
    // Validar outros campos
    const requiredFields = ['nome', 'documento', 'email', 'celular', 'dataNascimento'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.trim());
    
    if (missingFields.length > 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Se chegou até aqui, o formulário está válido
    handleFormSubmit(e);
  };

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

      <div className="p-6 rounded-lg mb-8 border border-purple-500/30 bg-purple-50/50 dark:bg-purple-900/10">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
            Nome completo *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
            placeholder="Digite seu nome completo"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              CPF *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => handleCPFChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:border-transparent bg-white dark:bg-stone-800 pr-10 ${
                  cpfValidation.isValid === null
                    ? 'border-stone-300 dark:border-stone-600 focus:ring-purple-500'
                    : cpfValidation.isValid
                    ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
                    : 'border-red-300 dark:border-red-600 focus:ring-red-500'
                }`}
                placeholder="000.000.000-00"
                maxLength={14} // CPF formatado: 000.000.000-00
                required
              />
              
              {/* Ícone de validação */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {cpfValidation.isValid === true && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {cpfValidation.isValid === false && cpfValidation.message && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            
            {/* Mensagem de validação */}
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
            <label className="block mb-2 font-medium text-stone-700 dark:text-stone-300">
              Data de Nascimento *
            </label>
            <input
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
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
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
              placeholder="seu.email@exemplo.com"
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
              onChange={(e) => handleCelularChange(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
              placeholder="(11) 99999-9999"
              maxLength={15} // (11) 99999-9999
              required
            />
          </div>
        </div>

        {/* Aviso de validação do formulário */}
        {cpfValidation.isValid === false && cpfValidation.message && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 dark:text-red-300 font-medium">
                Corrija o CPF antes de continuar
              </p>
            </div>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              {cpfValidation.message}
            </p>
          </div>
        )}

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
            disabled={isSubmitting || cpfValidation.isValid === false}
            className={`flex-1 bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-md transition-colors ${
              isSubmitting || cpfValidation.isValid === false
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            {isSubmitting ? 'Processando...' : 'Continuar para Pagamento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Formulario;