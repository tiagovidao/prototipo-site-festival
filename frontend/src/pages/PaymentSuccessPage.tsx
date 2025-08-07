// src/pages/PaymentSuccessPage.tsx
import React, { useState, useEffect } from 'react';
import { Check, Download, Home, Calendar, Clock, MapPin, User, CreditCard, Mail, Printer } from 'lucide-react';
import type { Event, FormData } from '../types';

interface PaymentSuccessProps {
  paymentData: { payment_id: string; status: string; method: string } | null;
  selectedEvents: string[];
  availableEvents: Event[];
  formData: FormData;
  onNewRegistration: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  paymentData,
  selectedEvents,
  availableEvents,
  formData,
  onNewRegistration
}) => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [registrationNumber] = useState(`FB${Date.now().toString().slice(-6)}`);
  const [currentDate] = useState(new Date());

  const totalAmount = selectedEvents.reduce((total, eventId) => {
    const event = availableEvents.find(e => e.id === eventId);
    return total + (event ? parseFloat(event.price.replace('R$ ', '').replace(',', '.')) : 0);
  }, 0);

  // Animação de celebração inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Função para download do comprovante
  const downloadReceipt = () => {
    const receipt = `
╔══════════════════════════════════════════════════════════════╗
║                    FESTIVAL DE BALLET                        ║
║                 COMPROVANTE DE INSCRIÇÃO                     ║
╚══════════════════════════════════════════════════════════════╝

📋 DADOS DA INSCRIÇÃO
Número: ${registrationNumber}
Data: ${currentDate.toLocaleDateString('pt-BR')}
Status: CONFIRMADA

👤 PARTICIPANTE
Nome: ${formData.nome}
Email: ${formData.email}
Documento: ${formData.documento}

🎭 EVENTOS CONFIRMADOS
${selectedEvents.map((eventId, index) => {
  const event = availableEvents.find(e => e.id === eventId);
  return `${index + 1}. ${event?.title}
   Instrutor: ${event?.instructor}
   Data: ${event?.date} | ${event?.time}
   Local: ${event?.location}
   Valor: ${event?.price}`;
}).join('\n\n')}

💳 PAGAMENTO
Método: ${paymentData?.method === 'pix' ? 'PIX' : 'Cartão de Crédito'}
Status: APROVADO
Total: R$ ${totalAmount.toFixed(2).replace('.', ',')}

Festival de Ballet - ${currentDate.toLocaleString('pt-BR')}
    `;

    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Festival-Ballet-${registrationNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Função para imprimir
  const printReceipt = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Comprovante - Festival de Ballet</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .event-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
                @media print { body { margin: 0; padding: 15px; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Festival de Ballet</h1>
                <h2>Comprovante de Inscrição</h2>
              </div>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 relative">
      {/* Animação de celebração */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center animate-pulse">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-3xl font-bold text-white mb-2">Parabéns!</div>
            <div className="text-lg text-white">Inscrição confirmada!</div>
          </div>
        </div>
      )}

      {/* Header de Sucesso */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl mb-3 bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
          Pagamento Aprovado!
        </h1>
        <p className="text-lg text-stone-600 dark:text-stone-400 mb-2">
          Sua inscrição foi confirmada
        </p>
        <p className="text-sm text-stone-500">
          Número: <span className="font-bold text-purple-600">{registrationNumber}</span>
        </p>
      </div>

      {/* Conteúdo imprimível */}
      <div id="receipt-content">
        {/* Resumo Principal */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800 mb-6 shadow-lg">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dados do Participante */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center text-purple-800 dark:text-purple-200">
                <User className="w-5 h-5 mr-2" />
                Participante
              </h3>
              <div className="space-y-2 text-stone-700 dark:text-stone-300">
                <div className="flex justify-between py-1">
                  <span className="text-sm">Nome:</span>
                  <span className="font-medium">{formData.nome}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm">Email:</span>
                  <span className="text-sm">{formData.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm">Status:</span>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm font-bold">
                    ✓ CONFIRMADA
                  </span>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center text-purple-800 dark:text-purple-200">
                <CreditCard className="w-5 h-5 mr-2" />
                Pagamento
              </h3>
              <div className="space-y-2 text-stone-700 dark:text-stone-300">
                <div className="flex justify-between py-1">
                  <span className="text-sm">Método:</span>
                  <span className="font-medium">
                    {paymentData?.method === 'pix' ? 'PIX' : 'Cartão'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm">Status:</span>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm font-bold">
                    ✓ APROVADO
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg text-green-600">
                    R$ {totalAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eventos Confirmados */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-purple-800 dark:text-purple-200">
            <Calendar className="w-5 h-5 mr-2" />
            Eventos ({selectedEvents.length})
          </h3>
          <div className="space-y-3">
            {selectedEvents.map((eventId, index) => {
              const event = availableEvents.find(e => e.id === eventId);
              return (
                <div key={eventId} className="bg-white dark:bg-stone-800 p-4 rounded-lg border border-stone-200 dark:border-stone-700 shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-sm font-bold mr-2">
                        {index + 1}
                      </span>
                      <span className="font-bold text-lg">{event?.title}</span>
                    </div>
                    <span className="font-bold text-green-600">{event?.price}</span>
                  </div>
                  <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">👨‍🏫 {event?.instructor}</p>
                  
                  <div className="grid md:grid-cols-3 gap-3 text-sm text-stone-600 dark:text-stone-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                      <span>{event?.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-purple-500" />
                      <span>{event?.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-purple-500" />
                      <span>{event?.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
          📋 Instruções
        </h3>
        <div className="text-sm text-stone-700 dark:text-stone-300 space-y-1">
          <p>• Chegue 15 minutos antes do horário</p>
          <p>• Traga documento com foto e roupas adequadas</p>
          <p>• Cancelamentos até 24h antes do evento</p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <button
          onClick={downloadReceipt}
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar
        </button>
        
        <button
          onClick={printReceipt}
          className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </button>
        
        <button
          onClick={onNewRegistration}
          className="flex items-center px-5 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 shadow-lg"
        >
          <Home className="w-4 h-4 mr-2" />
          Nova Inscrição
        </button>
      </div>

      {/* Confirmação por Email */}
      <div className="text-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-center mb-2">
          <Mail className="w-5 h-5 text-green-600 mr-2" />
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Email Enviado
          </h4>
        </div>
        <p className="text-stone-600 dark:text-stone-400 text-sm">
          Confirmação enviada para <strong>{formData.email}</strong>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700 text-center">
        <p className="text-stone-500 text-sm">
          🎭 Festival de Ballet • {currentDate.toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;