import React, { useState } from 'react';
import { CreditCard, QrCode, ArrowLeft, Loader2, CheckCircle2, Copy, TestTube } from 'lucide-react';
import type { Event, FormData } from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://festival-ballet-api.onrender.com/api'
  : 'http://localhost:3001/api';

interface PaymentFormProps {
  selectedEvents: string[];
  availableEvents: Event[];
  formData: FormData;
  onPaymentSuccess: (paymentData: { payment_id: string; status: string; method: string }) => void;
  onBack: () => void;
  totalAmount: number;
}

interface PixPaymentData {
  payment_id: string;
  qr_code: string;
  qr_code_base64: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  selectedEvents,
  availableEvents,
  formData,
  onPaymentSuccess,
  onBack,
  totalAmount
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixPayment, setPixPayment] = useState<PixPaymentData | null>(null);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    cpf: ''
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dados de teste para cartão
  const testCardData = {
    number: '5031 4332 1540 6351',
    cvc: '123',
    expiry: '11/30',
    cpf: '12345678909',
    name: 'TESTE CARTAO'
  };

  // Criar preferência de pagamento
  const createPaymentPreference = async (method: 'credit_card' | 'pix') => {
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');
      setErrorMessage(null);
      
      const paymentData = {
        items: selectedEvents.map(eventId => {
          const event = availableEvents.find(e => e.id === eventId);
          return {
            id: eventId,
            title: event?.title || 'Evento',
            unit_price: parseFloat(event?.price.replace('R$ ', '').replace(',', '.') || '0'),
            quantity: 1
          };
        }),
        payer: {
          name: formData.nome,
          email: formData.email,
          identification: {
            type: 'CPF',
            number: formData.documento
          }
        },
        payment_methods: {
          excluded_payment_types: method === 'pix' ? 
            [{ id: 'credit_card' }, { id: 'debit_card' }] : 
            [{ id: 'pix' }]
        }
      };

      const response = await fetch(`${API_BASE_URL}/payment/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentData, method })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar pagamento');
      }
      
      const result = await response.json();
      
      if (method === 'pix') {
        setPixPayment({
          payment_id: result.payment_id,
          qr_code: result.qr_code,
          qr_code_base64: result.qr_code_base64
        });
        setPaymentStatus('pending');
        pollPixPayment(result.payment_id);
      } else {
        await processCardPayment(result.preference_id);
      }
      
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Polling para verificar pagamento PIX
  const pollPixPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/check/${paymentId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao verificar pagamento');
      }
      
      const status = await response.json();
      
      if (status.status === 'approved') {
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentSuccess({
            payment_id: paymentId,
            status: 'approved',
            method: 'pix'
          });
        }, 1500);
      } else if (status.status === 'pending') {
        setTimeout(() => pollPixPayment(paymentId), 3000);
      } else {
        setErrorMessage('Pagamento não aprovado. Tente novamente.');
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    }
  };

  // Processar pagamento com cartão
  const processCardPayment = async (preferenceId: string) => {
    try {
      setPaymentStatus('processing');
      
      const paymentResult = await fetch(`${API_BASE_URL}/payment/process-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preference_id: preferenceId,
          card_data: cardData,
          installments: 1
        })
      });

      if (!paymentResult.ok) {
        const errorData = await paymentResult.json();
        throw new Error(errorData.error || 'Erro ao processar pagamento');
      }
      
      const result = await paymentResult.json();
      
      if (result.status === 'approved') {
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentSuccess({
            payment_id: result.payment_id,
            status: 'approved',
            method: 'credit_card'
          });
        }, 1500);
      } else {
        throw new Error('Pagamento recusado. Verifique os dados do cartão.');
      }
      
    } catch (error) {
      console.error('Erro no pagamento:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
      setPaymentStatus('error');
    }
  };

  // Função para preencher dados de teste
  const fillTestData = () => {
    setCardData({
      number: testCardData.number,
      expiry: testCardData.expiry,
      cvc: testCardData.cvc,
      name: testCardData.name,
      cpf: testCardData.cpf
    });
  };

  // Função para copiar um valor específico
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Você pode adicionar uma notificação visual aqui se desejar
      console.log(`${field} copiado: ${text}`);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  const resetPayment = () => {
    setPaymentMethod(null);
    setPixPayment(null);
    setCardData({ number: '', expiry: '', cvc: '', name: '', cpf: '' });
    setPaymentStatus('idle');
    setErrorMessage(null);
  };

  // Formatar valor para exibição
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl md:text-4xl mb-6 text-center pb-4 border-b border-stone-200 dark:border-stone-700">
        Pagamento
      </h1>

      {/* Resumo do pedido */}
      <div className="p-5 rounded-lg mb-6 border border-purple-500/30 bg-purple-50/50 dark:bg-purple-900/10">
        <h3 className="font-semibold text-lg mb-3">Resumo da inscrição:</h3>
        {selectedEvents.map(eventId => {
          const event = availableEvents.find(e => e.id === eventId);
          return (
            <div key={eventId} className="flex justify-between mb-2">
              <span>• {event?.title}</span>
              <span className="font-medium">{event?.price}</span>
            </div>
          );
        })}
        <div className="flex justify-between mt-3 pt-3 border-t border-stone-300 dark:border-stone-600 font-bold text-lg">
          <span>Total:</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Mensagens de erro */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
          <p className="font-medium">Erro no pagamento:</p>
          <p>{errorMessage}</p>
          <button 
            onClick={() => setErrorMessage(null)}
            className="mt-2 text-sm text-red-900 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Seleção de método de pagamento */}
      {paymentStatus === 'idle' && !paymentMethod && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Escolha a forma de pagamento:</h3>
          
          <button
            onClick={() => setPaymentMethod('pix')}
            className="w-full p-5 border border-stone-300 dark:border-stone-600 rounded-lg hover:border-green-500 transition-colors flex items-center justify-between bg-white dark:bg-stone-800"
          >
            <div className="flex items-center">
              <QrCode className="w-8 h-8 mr-4 text-green-600" />
              <div className="text-left">
                <div className="font-semibold">PIX</div>
                <div className="text-sm text-stone-600 dark:text-stone-400">
                  Pagamento instantâneo
                </div>
              </div>
            </div>
            <div className="text-green-600 font-bold">{formatCurrency(totalAmount)}</div>
          </button>

          <button
            onClick={() => setPaymentMethod('credit_card')}
            className="w-full p-5 border border-stone-300 dark:border-stone-600 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-between bg-white dark:bg-stone-800"
          >
            <div className="flex items-center">
              <CreditCard className="w-8 h-8 mr-4 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">Cartão de Crédito</div>
                <div className="text-sm text-stone-600 dark:text-stone-400">
                  À vista
                </div>
              </div>
            </div>
            <div className="text-blue-600 font-bold">{formatCurrency(totalAmount)}</div>
          </button>
        </div>
      )}

      {/* PIX */}
      {paymentMethod === 'pix' && paymentStatus !== 'success' && (
        <div className="text-center p-6 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800">
          {!pixPayment ? (
            <>
              <h3 className="text-xl font-semibold mb-4">Pagamento via PIX</h3>
              <p className="mb-4 text-stone-600 dark:text-stone-400">
                Gere o QR Code PIX para finalizar seu pagamento instantaneamente.
              </p>
              <button
                onClick={() => createPaymentPreference('pix')}
                disabled={isProcessing}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md transition-colors disabled:opacity-70 flex items-center justify-center mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando PIX...
                  </>
                ) : 'Gerar QR Code PIX'}
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-4">Pagamento via PIX</h3>
              
              {paymentStatus === 'pending' && (
                <>
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <img 
                      src={`data:image/png;base64,${pixPayment.qr_code_base64}`} 
                      alt="QR Code PIX" 
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                      Ou copie o código PIX:
                    </p>
                    <div className="bg-stone-100 dark:bg-stone-700 p-3 rounded-md text-sm break-all font-mono">
                      {pixPayment.qr_code}
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-green-600 font-semibold mb-4">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Aguardando confirmação do pagamento...
                  </div>
                </>
              )}
              
              {paymentStatus === 'processing' && (
                <div className="py-8 flex flex-col items-center">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                  <p>Processando pagamento PIX...</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Cartão de Crédito */}
      {paymentMethod === 'credit_card' && paymentStatus !== 'success' && (
        <div className="space-y-4 p-6 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800">
          {paymentStatus === 'idle' || paymentStatus === 'error' ? (
            <>
              <h3 className="text-xl font-semibold mb-4">Pagamento com Cartão de Crédito</h3>
              
              {/* Dados de Teste - Card de destaque */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <TestTube className="w-5 h-5 mr-2 text-orange-600" />
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200">Dados para Teste</h4>
                  </div>
                  <button
                    onClick={fillTestData}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    Preencher
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between bg-white dark:bg-stone-700 p-2 rounded border">
                    <div>
                      <span className="text-stone-500 text-xs">Número:</span>
                      <div className="font-mono font-bold">{testCardData.number}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(testCardData.number.replace(/\s/g, ''), 'Número')}
                      className="text-orange-600 hover:text-orange-700 transition-colors p-1"
                      title="Copiar número"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white dark:bg-stone-700 p-2 rounded border">
                    <div>
                      <span className="text-stone-500 text-xs">CVV:</span>
                      <div className="font-mono font-bold">{testCardData.cvc}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(testCardData.cvc, 'CVV')}
                      className="text-orange-600 hover:text-orange-700 transition-colors p-1"
                      title="Copiar CVV"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white dark:bg-stone-700 p-2 rounded border">
                    <div>
                      <span className="text-stone-500 text-xs">Validade:</span>
                      <div className="font-mono font-bold">{testCardData.expiry}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(testCardData.expiry, 'Validade')}
                      className="text-orange-600 hover:text-orange-700 transition-colors p-1"
                      title="Copiar validade"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white dark:bg-stone-700 p-2 rounded border">
                    <div>
                      <span className="text-stone-500 text-xs">CPF:</span>
                      <div className="font-mono font-bold">{testCardData.cpf}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(testCardData.cpf, 'CPF')}
                      className="text-orange-600 hover:text-orange-700 transition-colors p-1"
                      title="Copiar CPF"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-2 font-medium">
                  ⚠️ Use estes dados apenas para teste. Não são cartões reais.
                </p>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Número do cartão</label>
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Validade</label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">CVV</label>
                  <input
                    type="text"
                    value={cardData.cvc}
                    onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')})}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Nome no cartão</label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                  placeholder="NOME COMO NO CARTÃO"
                  className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">CPF do portador</label>
                <input
                  type="text"
                  value={cardData.cpf}
                  onChange={(e) => setCardData({...cardData, cpf: e.target.value.replace(/\D/g, '')})}
                  placeholder="00000000000"
                  maxLength={11}
                  className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-stone-800"
                />
              </div>

              <button
                onClick={() => createPaymentPreference('credit_card')}
                disabled={isProcessing || !cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name || !cardData.cpf}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : `Pagar ${formatCurrency(totalAmount)}`}
              </button>
            </>
          ) : paymentStatus === 'processing' && (
            <div className="py-8 flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
              <p>Processando pagamento...</p>
              <p className="text-sm text-stone-500 mt-2">Não feche esta página</p>
            </div>
          )}
        </div>
      )}

      {/* Feedback de sucesso */}
      {paymentStatus === 'success' && (
        <div className="text-center p-8 border border-green-300 rounded-lg bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">Pagamento Aprovado!</h3>
          <p className="text-lg mb-4">Sua inscrição foi confirmada com sucesso.</p>
          <p className="text-stone-600 dark:text-stone-300">
            Você será redirecionado em instantes...
          </p>
        </div>
      )}

      {/* Botões de navegação */}
      <div className="flex gap-4 mt-8 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center px-5 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md transition-colors bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </button>
        
        {paymentMethod && paymentStatus !== 'success' && (
          <button
            onClick={resetPayment}
            className="px-5 py-2.5 border border-stone-300 dark:border-stone-600 rounded-md transition-colors bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600"
            disabled={isProcessing}
          >
            Alterar forma de pagamento
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;