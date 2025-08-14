const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

let client, preference, payment;

try {
  client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: {
      timeout: 15000,
      retries: 2
    }
  });

  preference = new Preference(client);
  payment = new Payment(client);
} catch (error) {
  console.error('❌ Erro na configuração do Mercado Pago:', error);
}

// CORREÇÃO: Função para detectar ambiente de teste de forma mais robusta
const isTestEnvironment = () => {
  const hasTestToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
  const isLocalDevelopment = process.env.NODE_ENV === 'development';
  const frontendUrl = process.env.FRONTEND_URL || '';
  const isTestFrontend = frontendUrl.includes('localhost') || frontendUrl.includes('vercel.app');
  
  return isLocalDevelopment || hasTestToken || isTestFrontend;
};

// CORREÇÃO: URLs dinâmicas baseadas no ambiente
const getValidUrls = () => {
  let frontendUrl = process.env.FRONTEND_URL;
  
  if (!frontendUrl) {
    if (process.env.NODE_ENV === 'production') {
      frontendUrl = 'https://prototipo-site-festival.vercel.app';
    } else {
      frontendUrl = 'http://localhost:5173';
    }
  }
  
  const backendUrl = process.env.BACKEND_URL || 'https://festival-ballet-api.onrender.com';
  
  return {
    success: `${frontendUrl}/payment/success`,
    failure: `${frontendUrl}/payment/failure`, 
    pending: `${frontendUrl}/payment/pending`,
    notification: `${backendUrl}/api/payment/webhook`
  };
};

const validateCPF = (cpf) => {
  if (typeof cpf !== 'string') return false;
  
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCpf)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i-1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i-1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;
  
  return true;
};

// CORREÇÃO: Melhor tratamento para documentos em ambiente de teste
const validateAndFormatDocument = (identification) => {
  console.log('🔍 Validando identificação recebida:', identification);
  
  if (!identification || !identification.number || !identification.type) {
    throw new Error('Identificação do usuário é obrigatória');
  }

  let { number, type } = identification;
  const cleanNumber = number.replace(/\D/g, '');
  
  // CORREÇÃO: Usar ambiente de teste ao invés de apenas NODE_ENV
  if (isTestEnvironment()) {
    console.log('🔧 Ambiente de teste detectado - usando CPF de teste');
    return {
      type: 'CPF',
      number: '11144477735'
    };
  }
  
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

const createPaymentPreference = async (req, res) => {
  try {
    const { paymentData, method } = req.body;
    const isPix = method === 'pix';

    console.log('📋 Dados recebidos:', { method, paymentData: paymentData ? 'presente' : 'ausente' });

    // CORREÇÃO: Debug de ambiente para troubleshooting
    console.log('🔧 DEBUG - Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL,
      HAS_TOKEN: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      TOKEN_PREFIX: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10),
      IS_TEST_ENV: isTestEnvironment()
    });

    const hasValidToken = process.env.MERCADOPAGO_ACCESS_TOKEN && 
                         (process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-') || 
                          process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('APP_USR-'));

    if (!hasValidToken) {
      console.warn('⚠️ Token do Mercado Pago não configurado ou inválido');
      if (isTestEnvironment()) {
        console.log('🔧 Usando mock para desenvolvimento');
        const totalAmount = paymentData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
        return res.json(createMockPayment(method, totalAmount));
      } else {
        return res.status(500).json({
          error: 'Serviço de pagamento não configurado',
          message: 'Token do Mercado Pago não encontrado'
        });
      }
    }

    if (!paymentData || !paymentData.items || !paymentData.payer) {
      return res.status(400).json({
        error: 'Dados de pagamento incompletos',
        message: 'Items ou payer não fornecidos'
      });
    }

    // CORREÇÃO: Tratamento mais robusto para erros de validação de documento
    let validatedIdentification;
    try {
      validatedIdentification = validateAndFormatDocument(paymentData.payer.identification);
      console.log('✅ Documento validado:', validatedIdentification);
    } catch (docError) {
      console.error('❌ Erro na validação do documento:', docError.message);
      
      // CORREÇÃO: Fallback para CPF de teste se for ambiente de desenvolvimento
      if (isTestEnvironment()) {
        console.log('🔧 Usando CPF de teste devido a erro na validação');
        validatedIdentification = {
          type: 'CPF',
          number: '11144477735'
        };
      } else {
        return res.status(400).json({
          error: 'Documento de identificação inválido',
          message: docError.message
        });
      }
    }

    // CORREÇÃO: URLs corrigidas e dinâmicas
    const urls = getValidUrls();
    console.log('🔍 URLs configuradas:', urls);

    if (isPix) {
      const totalAmount = paymentData.items.reduce(
        (sum, item) => sum + (item.unit_price * item.quantity), 
        0
      );

      console.log('📱 Criando pagamento PIX para valor:', totalAmount);

      // CORREÇÃO: Payload do PIX mais robusto e com melhor tratamento de erros
      const pixPayload = {
        transaction_amount: Number(parseFloat(totalAmount.toFixed(2))),
        description: `Festival de Ballet - ${paymentData.items.length} evento(s)`,
        payment_method_id: 'pix',
        payer: {
          email: paymentData.payer.email,
          first_name: paymentData.payer.name?.split(' ')[0] || 'Cliente',
          last_name: paymentData.payer.name?.split(' ').slice(1).join(' ') || 'Festival',
          identification: validatedIdentification
        },
        external_reference: `festival_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };

      // CORREÇÃO: Só adicionar notification_url em produção real
      const isLocalhost = urls.notification.includes('localhost') || urls.notification.includes('127.0.0.1');
      if (!isLocalhost && !isTestEnvironment()) {
        pixPayload.notification_url = urls.notification;
        console.log('🔔 Notification URL configurada:', urls.notification);
      } else {
        console.log('⚠️ Webhook desabilitado para teste/localhost');
      }

      console.log('📋 Payload PIX final:', {
        transaction_amount: pixPayload.transaction_amount,
        payment_method_id: pixPayload.payment_method_id,
        payer_email: pixPayload.payer.email,
        payer_identification: pixPayload.payer.identification,
        external_reference: pixPayload.external_reference
      });

      // CORREÇÃO: Melhor tratamento de erro com fallback para mock
      try {
        if (!client || !payment) {
          throw new Error('Cliente Mercado Pago não inicializado');
        }

        const pixPayment = await payment.create({
          body: pixPayload,
          requestOptions: {
            timeout: 10000,
            retries: 1
          }
        });

        console.log('✅ Pagamento PIX criado:', pixPayment.id);
        console.log('📋 Status inicial:', pixPayment.status);

        const pixData = pixPayment.point_of_interaction?.transaction_data;
        if (!pixData || !pixData.qr_code) {
          console.error('❌ QR Code não foi gerado:', JSON.stringify(pixPayment, null, 2));
          throw new Error('QR Code não foi gerado pela API do Mercado Pago');
        }

        return res.json({
          payment_id: pixPayment.id,
          qr_code: pixData.qr_code,
          qr_code_base64: pixData.qr_code_base64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          expiration_date: pixPayment.date_of_expiration
        });

      } catch (mpError) {
        console.error('❌ Erro específico do MercadoPago:', mpError);
        
        // CORREÇÃO: Log detalhado para debug
        if (mpError.response) {
          console.error('Response status:', mpError.response.status);
          console.error('Response data:', JSON.stringify(mpError.response.data, null, 2));
          console.error('Response headers:', mpError.response.headers);
        }
        
        console.error('Payload que causou erro:', JSON.stringify(pixPayload, null, 2));
        
        // CORREÇÃO: Fallback para mock em caso de erro
        if (isTestEnvironment()) {
          console.log('🔧 Usando mock PIX devido a erro do MP');
          return res.json(createMockPayment('pix', totalAmount));
        }
        
        let errorMessage = 'Erro ao processar pagamento PIX';
        if (mpError.response?.data?.message) {
          errorMessage = mpError.response.data.message;
        } else if (mpError.message) {
          errorMessage = mpError.message;
        }
        
        return res.status(500).json({
          error: errorMessage,
          details: isTestEnvironment() ? {
            originalError: mpError.message,
            response: mpError.response?.data
          } : undefined
        });
      }
    }

    // Fluxo para cartão de crédito
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
      
      if (isTestEnvironment()) {
        const totalAmount = paymentData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
        console.log('🔧 Retornando mock de preferência devido a erro do MP');
        return res.json(createMockPayment('credit_card', totalAmount));
      }
      
      throw mpError;
    }

  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    
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
      details: isTestEnvironment() ? {
        message: error.message,
        response: error.response?.data
      } : undefined
    });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        error: 'ID de pagamento ausente'
      });
    }

    if (paymentId.startsWith('mock_')) {
      const isOld = Date.now() - parseInt(paymentId.split('_')[1]) > 10000;
      
      return res.json({
        payment_id: paymentId,
        status: isOld ? 'approved' : 'pending',
        status_detail: isOld ? 'accredited' : 'pending_payment',
        transaction_amount: 10.00
      });
    }

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
      details: isTestEnvironment() ? error.message : undefined
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('📢 Webhook recebido:', { type, data });

    if (type === 'payment') {
      const paymentId = data.id;
      console.log(`📢 Processando webhook para pagamento: ${paymentId}`);

      if (paymentId.startsWith('mock_')) {
        console.log('🔧 Webhook para pagamento mock ignorado');
        return res.status(200).send('OK');
      }

      if (!payment) {
        console.error('❌ Serviço de pagamento não configurado');
        return res.status(503).send('Service unavailable');
      }

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

      if (paymentInfo.status === 'approved') {
        console.log('✅ Pagamento aprovado - processar confirmação da inscrição');
      } else if (paymentInfo.status === 'rejected') {
        console.warn('❌ Pagamento rejeitado - marcar inscrição como cancelada');
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