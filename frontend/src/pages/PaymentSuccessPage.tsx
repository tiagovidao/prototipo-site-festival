// src/pages/PaymentSuccessPage.tsx
import React, { useState, useEffect } from 'react';
import { Check, Download, Home, Calendar, Clock, MapPin, User, CreditCard, Share2, Mail, Printer } from 'lucide-react';
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
    }, 3000);
    
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
─────────────────────────────────────────────────────────────
🎫 Número: ${registrationNumber}
📅 Data: ${currentDate.toLocaleDateString('pt-BR')}
⏰ Horário: ${currentDate.toLocaleTimeString('pt-BR')}
✅ Status: CONFIRMADA

👤 DADOS DO PARTICIPANTE
─────────────────────────────────────────────────────────────
Nome: ${formData.nome}
Documento: ${formData.documento}
Email: ${formData.email}
Celular: ${formData.celular}
Data de Nascimento: ${new Date(formData.dataNascimento).toLocaleDateString('pt-BR')}

🎭 EVENTOS CONFIRMADOS
─────────────────────────────────────────────────────────────
${selectedEvents.map((eventId, index) => {
  const event = availableEvents.find(e => e.id === eventId);
  return `${index + 1}. ${event?.title}
   👨‍🏫 Instrutor: ${event?.instructor}
   📅 Data: ${event?.date}
   ⏰ Horário: ${event?.time}
   📍 Local: ${event?.location}
   💰 Valor: ${event?.price}
   ──────────────────────────────────────────────`;
}).join('\n')}

💳 DETALHES DO PAGAMENTO
─────────────────────────────────────────────────────────────
Método: ${paymentData?.method === 'pix' ? '💳 PIX' : '💳 Cartão de Crédito'}
Status: ${paymentData?.status === 'approved' ? '✅ APROVADO' : '⏳ PENDENTE'}
ID do Pagamento: ${paymentData?.payment_id}
Total Pago: R$ ${totalAmount.toFixed(2).replace('.', ',')}

📝 INSTRUÇÕES IMPORTANTES
─────────────────────────────────────────────────────────────
• Chegue 15 minutos antes do horário de cada evento
• Traga roupas adequadas para ballet (collant, sapatilhas)
• Apresente um documento com foto na entrada
• Mantenha-se hidratado - traga uma garrafa de água
• Cancelamentos podem ser feitos até 24h antes do evento
• Este comprovante serve como ingresso - apresente na entrada

📞 CONTATO E SUPORTE
─────────────────────────────────────────────────────────────
Em caso de dúvidas, acesse nossa página de contato no site
ou mantenha este comprovante para referência.

🎭 Obrigado por participar do Festival de Ballet! 🎭
Desejamos uma experiência incrível e transformadora!

═══════════════════════════════════════════════════════════════
Documento gerado automaticamente em ${currentDate.toLocaleString('pt-BR')}
    `;

    // Criar download do arquivo
    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Festival-Ballet-Comprovante-${registrationNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Função para compartilhar (se suportado pelo navegador)
  const shareRegistration = async () => {
    const shareData = {
      title: 'Festival de Ballet - Inscrição Confirmada!',
      text: `Acabei de me inscrever no Festival de Ballet! 🎭\nInscrição: ${registrationNumber}\nEventos: ${selectedEvents.length}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback para cópia do link
      const textToCopy = `🎭 Festival de Ballet - Inscrição Confirmada!\n\nNúmero: ${registrationNumber}\nEventos: ${selectedEvents.length}\nTotal: R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
        alert('Informações copiadas para a área de transferência!');
      }
    }
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
                body { 
                  font-family: Arial, sans-serif; 
                  padding: 20px; 
                  background-color: #fff;
                  color: #000;
                }
                .header { 
                  text-align: center; 
                  border-bottom: 2px solid #333; 
                  padding-bottom: 10px; 
                  margin-bottom: 20px; 
                }
                .section { margin-bottom: 15px; }
                .event-card { 
                  border: 1px solid #ddd; 
                  padding: 15px; 
                  margin: 10px 0; 
                  border-radius: 8px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                @media print { 
                  body { margin: 0; padding: 15px; } 
                  .no-print { display: none !important; }
                }
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
    <div className="max-w-4xl mx-auto px-4 py-16 relative">
      {/* Animação de celebração */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center animate-pulse">
            <div className="text-8xl mb-4">🎉</div>
            <div className="text-4xl font-bold text-white mb-2">Parabéns!</div>
            <div className="text-xl text-white">Sua inscrição foi confirmada!</div>
          </div>
        </div>
      )}

      {/* Header de Sucesso */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
          <Check className="w-14 h-14 text-white" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl mb-4 bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
          Pagamento Aprovado!
        </h1>
        <p className="text-xl text-stone-600 dark:text-stone-400 mb-2">
          Sua inscrição foi confirmada com sucesso
        </p>
        <p className="text-sm text-stone-500 dark:text-stone-500">
          Número da inscrição: <span className="font-bold text-purple-600">{registrationNumber}</span>
        </p>
      </div>

      {/* Conteúdo imprimível */}
      <div id="receipt-content">
        {/* Cartão de Resumo Principal */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-2xl border border-purple-200 dark:border-purple-800 mb-8 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Dados do Participante */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-purple-800 dark:text-purple-200">
                <User className="w-5 h-5 mr-2" />
                Dados da Inscrição
              </h3>
              <div className="space-y-3 text-stone-700 dark:text-stone-300">
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium">Nome:</span>
                  <span className="font-semibold">{formData.nome}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{formData.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium">Documento:</span>
                  <span className="font-mono text-sm">{formData.documento}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-bold">
                    ✓ CONFIRMADA
                  </span>
                </div>
              </div>
            </div>

            {/* Detalhes do Pagamento */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-purple-800 dark:text-purple-200">
                <CreditCard className="w-5 h-5 mr-2" />
                Pagamento
              </h3>
              <div className="space-y-3 text-stone-700 dark:text-stone-300">
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium">Método:</span>
                  <span className="font-medium">
                    {paymentData?.method === 'pix' ? '💳 PIX' : '💳 Cartão de Crédito'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium">ID:</span>
                  <span className="font-mono text-xs">{paymentData?.payment_id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-purple-200 dark:border-purple-700">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-bold">
                    ✓ APROVADO
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-lg">
                  <span className="font-bold text-lg">Total Pago:</span>
                  <span className="font-bold text-2xl text-green-600">
                    R$ {totalAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eventos Confirmados */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center text-purple-800 dark:text-purple-200">
            <Calendar className="w-6 h-6 mr-2" />
            Eventos Confirmados ({selectedEvents.length})
          </h3>
          <div className="grid gap-4">
            {selectedEvents.map((eventId, index) => {
              const event = availableEvents.find(e => e.id === eventId);
              return (
                <div key={eventId} className="bg-white dark:bg-stone-800 p-6 rounded-xl border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-bold mr-3">
                          Evento {index + 1}
                        </span>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-bold">
                          ✓ CONFIRMADO
                        </span>
                      </div>
                      <h4 className="font-bold text-xl mb-2 text-stone-900 dark:text-stone-100">{event?.title}</h4>
                      <p className="text-purple-600 dark:text-purple-400 font-medium mb-3">👨‍🏫 {event?.instructor}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl text-green-600 mb-1">{event?.price}</div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-600 dark:text-stone-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{event?.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{event?.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{event?.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instruções Importantes */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">
          📋 Instruções Importantes
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-stone-700 dark:text-stone-300">
          <ul className="space-y-2">
            <li className="flex items-start">
              <Clock className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
              <span><strong>Chegada:</strong> 15 minutos antes do horário</span>
            </li>
            <li className="flex items-start">
              <User className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
              <span><strong>Vestimenta:</strong> Roupas adequadas para ballet</span>
            </li>
            <li className="flex items-start">
              <CreditCard className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
              <span><strong>Documento:</strong> Apresente RG/CPF na entrada</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Download className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
              <span><strong>Material:</strong> Traga garrafa de água</span>
            </li>
            <li className="flex items-start">
              <Calendar className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
              <span><strong>Cancelamento:</strong> Até 24h antes do evento</span>
            </li>
            <li className="flex items-start">
              <Mail className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
              <span><strong>Dúvidas:</strong> Acesse nossa página de contato</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-4 justify-center items-center mb-8">
        <button
          onClick={downloadReceipt}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Download className="w-5 h-5 mr-2" />
          Baixar Comprovante
        </button>
        
        <button
          onClick={printReceipt}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <Printer className="w-5 h-5 mr-2" />
          Imprimir
        </button>

        <button
          onClick={shareRegistration}
          className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Compartilhar
        </button>
        
        <button
          onClick={onNewRegistration}
          className="flex items-center px-6 py-3 border border-stone-300 dark:border-stone-600 rounded-lg transition-colors bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 shadow-lg hover:shadow-xl"
        >
          <Home className="w-5 h-5 mr-2" />
          Nova Inscrição
        </button>
      </div>

      {/* Confirmação por Email */}
      <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-center mb-3">
          <Mail className="w-6 h-6 text-green-600 mr-2" />
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Confirmação Enviada
          </h4>
        </div>
        <p className="text-stone-600 dark:text-stone-400 mb-2">
          📧 Um email de confirmação foi enviado para <strong className="text-green-700 dark:text-green-300">{formData.email}</strong>
        </p>
        <p className="text-sm text-stone-500 dark:text-stone-500">
          Verifique também sua caixa de spam. Guarde este comprovante como backup!
        </p>
      </div>

      {/* Footer com informações adicionais */}
      <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-700 text-center">
        <p className="text-stone-500 dark:text-stone-500 text-sm mb-2">
          🎭 Obrigado por escolher o Festival de Ballet!
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-600">
          Comprovante gerado em {currentDate.toLocaleString('pt-BR')} • ID: {registrationNumber}
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;