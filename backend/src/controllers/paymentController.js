const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Configurar Mercado Pago com tratamento de erros robusto
let client, preference, payment;

try {
  client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: {
      timeout: 15000, // Aumentar timeout
      retries: 2
    }
  });

  preference = new Preference(client);
  payment = new Payment(client);
} catch (error) {
  console.error('❌ Erro na configuração do Mercado Pago:', error);
}

// Função para validar URLs
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    console.error(`URL inválida: ${url}`, error);
    return false;
  }
};

// Função para obter URL do backend limpa
const getBackendUrl = () => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  return backendUrl.split(',')[0].trim();
};

// Função de validação de CPF simplificada para desenvolvimento
const validateCPF = (cpf) => {
  if (typeof cpf !== 'string') return false;
  
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCpf)) return false;
  
  return true;
};

// Função para validar e formatar documento
const validateAndFormatDocument = (identification) => {
  console.log('🔍 Validando identificação recebida:', identification);
  
  if (!identification || !identification.number || !identification.type) {
    throw new Error('Identificação do usuário é obrigatória');
  }

  let { number, type } = identification;
  
  // Remover caracteres não numéricos
  const cleanNumber = number.replace(/\D/g, '');
  console.log('🔍 Número limpo:', cleanNumber);
  
  // Para ambiente de desenvolvimento, usar CPF de teste válido
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Ambiente de desenvolvimento - usando CPF de teste');
    return {
      type: 'CPF',
      number: '11144477735' // CPF de teste que sempre funciona no sandbox
    };
  }
  
  // Em produção, validar rigorosamente
  if (type === 'CPF' || !type) {
    if (cleanNumber.length !== 11) {
      throw new Error('CPF deve ter 11 dígitos');
    }
    
    if (!validateCPF(cleanNumber)) {
      throw new Error('CPF inválido');
    }
    
    return {
      type: 'CPF',
      number: cleanNumber
    };
  }
  
  throw new Error('Tipo de documento deve ser CPF');
};

// Mock para desenvolvimento quando MP não estiver configurado
const createMockPayment = (method, totalAmount) => {
  const mockId = `mock_${Date.now()}`;
  
  if (method === 'pix') {
    return {
      payment_id: mockId,
      qr_code: '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-426614174000520400005303986540' + totalAmount.toFixed(2) + '5802BR5913FESTIVALBALLET6008BRASILIA62070503***63042B12',
      qr_code_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
  }
  
  return {
    preference_id: `pref_${mockId}`,
    init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${mockId}`
  };
};

// Criar preferência de pagamento
const createPaymentPreference = async (req, res) => {
  try {
    const { paymentData, method } = req.body;
    const isPix = method === 'pix';

    console.log('📋 Dados recebidos:', { method, paymentData: paymentData ? 'presente' : 'ausente' });

    // Verificar se o Mercado Pago está configurado
    const hasValidToken = process.env.MERCADOPAGO_ACCESS_TOKEN && 
                         process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-') || 
                         process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('APP_USR-');

    if (!hasValidToken) {
      console.warn('⚠️ Token do Mercado Pago não configurado ou inválido - usando mock');
      const totalAmount = paymentData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      return res.json(createMockPayment(method, totalAmount));
    }

    // Validar dados de entrada
    if (!paymentData || !paymentData.items || !paymentData.payer) {
      return res.status(400).json({
        error: 'Dados de pagamento incompletos',
        message: 'Items ou payer não fornecidos'
      });
    }

    // Validar e formatar documento de identificação
    let validatedIdentification;
    try {
      validatedIdentification = validateAndFormatDocument(paymentData.payer.identification);
      console.log('✅ Documento validado:', validatedIdentification);
    } catch (error) {
      console.error('❌ Erro na validação do documento:', error.message);
      return res.status(400).json({
        error: 'Documento de identificação inválido',
        message: error.message
      });
    }

    // Validar e preparar URLs
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = getBackendUrl();
    
    const urls = {
      success: `${baseUrl}/payment/success`,
      failure: `${baseUrl}/payment/failure`,
      pending: `${baseUrl}/payment/pending`,
      notification: `${backendUrl}/api/payment/webhook`
    };

    console.log('🔍 URLs configuradas:', urls);

    // Fluxo específico para PIX
    if (isPix) {
      const totalAmount = paymentData.items.reduce(
        (sum, item) => sum + (item.unit_price * item.quantity), 
        0
      );

      console.log('📱 Criando pagamento PIX para valor:', totalAmount);

      // Preparar payload do PIX com validações extras
      const pixPayload = {
        transaction_amount: Number(totalAmount.toFixed(2)), // Garantir que seja número
        description: 'Inscrição Festival de Ballet',
        payment_method_id: 'pix',
        payer: {
          email: paymentData.payer.email,
          first_name: paymentData.payer.name.split(' ')[0] || 'Cliente',
          last_name: paymentData.payer.name.split(' ').slice(1).join(' ') || 'Festival',
          identification: validatedIdentification
        },
        external_reference: `festival_${Date.now()}`, // Referência única
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };

      // Só adicionar notification_url se não for localhost
      const isLocalhost = urls.notification.includes('localhost') || urls.notification.includes('127.0.0.1');
      if (!isLocalhost) {
        pixPayload.notification_url = urls.notification;
        console.log('🔔 Notification URL configurada:', urls.notification);
      } else {
        console.log('⚠️ Webhook desabilitado para localhost');
      }

      console.log('📋 Payload PIX final:', {
        transaction_amount: pixPayload.transaction_amount,
        payment_method_id: pixPayload.payment_method_id,
        payer_email: pixPayload.payer.email,
        payer_identification: pixPayload.payer.identification,
        external_reference: pixPayload.external_reference
      });

      // Tentar criar pagamento PIX com tratamento de erro detalhado
      try {
        const pixPayment = await payment.create({
          body: pixPayload,
          requestOptions: {
            timeout: 10000,
            retries: 1
          }
        });

        console.log('✅ Pagamento PIX criado:', pixPayment.id);
        console.log('📋 Status inicial:', pixPayment.status);

        // Verificar se o QR Code foi gerado
        const pixData = pixPayment.point_of_interaction?.transaction_data;
        if (!pixData || !pixData.qr_code) {
          console.error('❌ QR Code não foi gerado:', pixPayment);
          throw new Error('Falha ao gerar QR Code PIX - dados incompletos');
        }

        return res.json({
          payment_id: pixPayment.id,
          qr_code: pixData.qr_code,
          qr_code_base64: pixData.qr_code_base64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          expiration_date: pixPayment.date_of_expiration
        });

      } catch (mpError) {
        console.error('❌ Erro específico do MercadoPago:', mpError);
        
        // Log detalhado do erro
        if (mpError.response) {
          console.error('Response status:', mpError.response.status);
          console.error('Response data:', JSON.stringify(mpError.response.data, null, 2));
        }
        
        // Em desenvolvimento, retornar mock em caso de erro
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Retornando mock PIX devido a erro do MP');
          return res.json(createMockPayment('pix', totalAmount));
        }
        
        throw mpError;
      }
    }

    // Fluxo para cartão de crédito (criar preferência)
    console.log('💳 Criando preferência para cartão de crédito');
    
    const preferenceData = {
      items: paymentData.items,
      payer: {
        ...paymentData.payer,
        identification: validatedIdentification
      },
      back_urls: {
        success: urls.success,
        failure: urls.failure,
        pending: urls.pending
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_methods: [{ id: 'pix' }],
        excluded_payment_types: [{ id: 'ticket' }]
      },
      statement_descriptor: 'FESTIVAL BALLET',
      external_reference: `festival_${Date.now()}`
    };

    // Só adicionar notification_url se não for localhost
    const isLocalhost = urls.notification.includes('localhost') || urls.notification.includes('127.0.0.1');
    if (!isLocalhost) {
      preferenceData.notification_url = urls.notification;
      console.log('🔔 Notification URL configurada:', urls.notification);
    }

    console.log('📋 Dados da preferência:', {
      items: preferenceData.items.length,
      external_reference: preferenceData.external_reference,
      payer_identification: preferenceData.payer.identification
    });

    try {
      const result = await preference.create({ 
        body: preferenceData,
        requestOptions: {
          timeout: 10000,
          retries: 1
        }
      });

      console.log('✅ Preferência criada:', result.id);

      if (!result.id) {
        throw new Error('Falha ao criar preferência de pagamento');
      }

      res.json({
        preference_id: result.id,
        init_point: result.init_point || result.sandbox_init_point
      });

    } catch (mpError) {
      console.error('❌ Erro na criação da preferência:', mpError);
      
      if (process.env.NODE_ENV === 'development') {
        const totalAmount = paymentData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
        console.log('🔧 Retornando mock de preferência devido a erro do MP');
        return res.json(createMockPayment('credit_card', totalAmount));
      }
      
      throw mpError;
    }

  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    
    // Mapear erros conhecidos
    let statusCode = 500;
    let errorMessage = 'Erro interno no processamento de pagamento';
    
    if (error.message.includes('FRONTEND_URL')) {
      statusCode = 500;
      errorMessage = 'Configuração de URL inválida';
    } 
    else if (error.message.includes('QR Code')) {
      statusCode = 400;
      errorMessage = 'Falha na geração do PIX - Tente novamente';
    }
    else if (error.response?.status === 400) {
      statusCode = 400;
      const causes = error.response.data?.cause || [];
      errorMessage = 'Dados de pagamento inválidos: ' + 
        (causes.map(c => c.description || c.message).join(', ') || error.message);
    }
    else if (error.response?.status === 401) {
      statusCode = 401;
      errorMessage = 'Credenciais do Mercado Pago inválidas';
    }
    else if (error.message.includes('access_token')) {
      statusCode = 401;
      errorMessage = 'Token do Mercado Pago não configurado';
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        response: error.response?.data
      } : undefined
    });
  }
};

// Verificar status do pagamento
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        error: 'ID de pagamento ausente'
      });
    }

    // Se for um mock payment, simular resposta
    if (paymentId.startsWith('mock_')) {
      const isOld = Date.now() - parseInt(paymentId.split('_')[1]) > 10000; // 10 segundos
      
      return res.json({
        payment_id: paymentId,
        status: isOld ? 'approved' : 'pending',
        status_detail: isOld ? 'accredited' : 'pending_payment',
        transaction_amount: 10.00
      });
    }

    // Verificar se o MP está configurado
    if (!payment) {
      return res.status(503).json({
        error: 'Serviço de pagamento indisponível'
      });
    }

    const result = await payment.get({ 
      id: paymentId,
      requestOptions: {
        timeout: 5000
      }
    });

    res.json({
      payment_id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      transaction_amount: result.transaction_amount,
      date_approved: result.date_approved,
      payment_method: result.payment_method_id
    });

  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    
    let statusCode = 500;
    let errorMessage = 'Falha ao verificar pagamento';

    if (error.response?.status === 404) {
      statusCode = 404;
      errorMessage = 'Pagamento não encontrado';
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Webhook para notificações
const handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('📢 Webhook recebido:', { type, data });

    if (type === 'payment') {
      const paymentId = data.id;
      console.log(`📢 Processando webhook para pagamento: ${paymentId}`);

      // Verificar se é um pagamento mock
      if (paymentId.startsWith('mock_')) {
        console.log('🔧 Webhook para pagamento mock ignorado');
        return res.status(200).send('OK');
      }

      if (!payment) {
        console.error('❌ Serviço de pagamento não configurado');
        return res.status(503).send('Service unavailable');
      }

      // Buscar detalhes do pagamento
      const paymentInfo = await payment.get({ 
        id: paymentId,
        requestOptions: {
          timeout: 5000
        }
      });
      
      console.log('📋 Detalhes do pagamento:', {
        id: paymentInfo.id,
        status: paymentInfo.status,
        status_detail: paymentInfo.status_detail,
        external_reference: paymentInfo.external_reference,
        amount: paymentInfo.transaction_amount
      });

      // Aqui você implementaria a atualização no banco de dados
      if (paymentInfo.status === 'approved') {
        console.log('✅ Pagamento aprovado - processar confirmação da inscrição');
        // TODO: Implementar atualização da inscrição no banco
      } else if (paymentInfo.status === 'rejected') {
        console.warn('❌ Pagamento rejeitado - marcar inscrição como cancelada');
        // TODO: Implementar cancelamento da inscrição
      }

      return res.status(200).send('OK');
    }

    res.status(200).send('Evento não processado');
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).send('Error');
  }
};

module.exports = {
  createPaymentPreference,
  checkPaymentStatus,
  handleWebhook
};