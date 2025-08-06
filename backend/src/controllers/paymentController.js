const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Configurar Mercado Pago com opções robustas
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 10000,
    idempotencyKey: 'festival-ballet-' + Date.now().toString(36)
  }
});

const preference = new Preference(client);
const payment = new Payment(client);

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
  // Se tiver múltiplas URLs separadas por vírgula, pega a primeira
  return backendUrl.split(',')[0].trim();
};

// Função para validar CPF (algoritmo básico)
const validateCPF = (cpf) => {
  if (typeof cpf !== 'string') return false;
  
  // Remove formatação
  cpf = cpf.replace(/[\D]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
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
  
  // Validar formato baseado no tipo
  if (type === 'CPF' || !type) { // Assumir CPF como padrão
    // Para ambiente de desenvolvimento/teste, usar CPFs de teste válidos
    if (process.env.NODE_ENV === 'development') {
      // CPFs de teste recomendados pelo MercadoPago para sandbox
      const testCPFs = [
        '11144477735', // Sempre aprova pagamentos
        '12345678909', // CPF de teste geral
        '01234567890', // CPF de teste alternativo
        '11122233396', // CPF de teste adicional
        '44477735530'  // CPF de teste adicional
      ];
      
      console.log('🔍 CPF fornecido:', cleanNumber);
      
      // Se o CPF limpo tiver menos de 11 dígitos, completar com zeros à esquerda
      let paddedCPF = cleanNumber.padStart(11, '0');
      console.log('🔍 CPF com padding:', paddedCPF);
      
      // Se for um CPF de teste válido, usar como está
      if (testCPFs.includes(paddedCPF)) {
        console.log('✅ Usando CPF de teste válido:', paddedCPF);
        return {
          type: 'CPF',
          number: paddedCPF
        };
      } else {
        // Verificar se é um CPF válido usando algoritmo
        if (validateCPF(paddedCPF)) {
          console.log('✅ CPF válido fornecido:', paddedCPF);
          return {
            type: 'CPF',
            number: paddedCPF
          };
        } else {
          // Se não for válido, usar um CPF padrão para sandbox
          console.log('⚠️ CPF inválido, usando CPF padrão para sandbox');
          return {
            type: 'CPF',
            number: '11144477735' // CPF de teste que sempre funciona
          };
        }
      }
    } else {
      // Em produção, validar rigorosamente
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
  } else if (type === 'CNPJ') {
    if (cleanNumber.length !== 14) {
      throw new Error('CNPJ deve ter 14 dígitos');
    }
    // Adicionar validação de CNPJ se necessário
    return {
      type: 'CNPJ',
      number: cleanNumber
    };
  } else {
    throw new Error('Tipo de documento deve ser CPF ou CNPJ');
  }
};

// Criar preferência de pagamento
const createPaymentPreference = async (req, res) => {
  try {
    const { paymentData, method } = req.body;
    const isPix = method === 'pix';

    console.log('📋 Dados recebidos:', { method, paymentData: paymentData ? 'presente' : 'ausente' });

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

    // Validar URLs críticas
    if (!validateUrl(urls.success)) {
      throw new Error('FRONTEND_URL inválida no ambiente');
    }
    
    if (!validateUrl(urls.notification)) {
      throw new Error('BACKEND_URL inválida no ambiente - URL de notificação não é válida');
    }

    // Preparar dados básicos para ambos os métodos
    const basePaymentData = {
      items: paymentData.items,
      payer: {
        ...paymentData.payer,
        identification: validatedIdentification // Usar identificação validada
      },
      statement_descriptor: 'FESTIVAL BALLET',
      external_reference: `registration_${Date.now()}`,
    };

    // Fluxo específico para PIX
    if (isPix) {
      // Calcular valor total
      const totalAmount = paymentData.items.reduce(
        (sum, item) => sum + (item.unit_price * item.quantity), 
        0
      );

      console.log('📱 Criando pagamento PIX para valor:', totalAmount);

      // Preparar payload do PIX
      const pixPayload = {
        transaction_amount: totalAmount,
        description: 'Inscrição Festival de Ballet',
        payment_method_id: 'pix',
        payer: {
          email: paymentData.payer.email,
          first_name: paymentData.payer.name.split(' ')[0] || 'Cliente',
          last_name: paymentData.payer.name.split(' ').slice(1).join(' ') || 'Festival',
          identification: validatedIdentification
        },
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos para expirar
      };

      // Só adicionar notification_url se não for localhost (para evitar erro em desenvolvimento)
      const isLocalhost = urls.notification.includes('localhost') || urls.notification.includes('127.0.0.1');
      if (!isLocalhost) {
        pixPayload.notification_url = urls.notification;
        console.log('🔔 Notification URL configurada:', urls.notification);
      } else {
        console.log('⚠️ Webhook desabilitado para localhost - use ngrok para testar webhooks');
      }

      // Criar pagamento PIX direto
      const pixPayment = await payment.create({
        body: pixPayload
      });

      console.log('✅ Pagamento PIX criado:', pixPayment.id);

      // Verificar se o QR Code foi gerado
      const pixData = pixPayment.point_of_interaction?.transaction_data;
      if (!pixData || !pixData.qr_code || !pixData.qr_code_base64) {
        throw new Error('Falha ao gerar QR Code PIX');
      }

      return res.json({
        payment_id: pixPayment.id,
        qr_code: pixData.qr_code,
        qr_code_base64: pixData.qr_code_base64,
        expiration_date: pixData.date_of_expiration
      });
    }

    // Fluxo para cartão de crédito (criar preferência)
    console.log('💳 Criando preferência para cartão de crédito');
    
    const preferenceData = {
      ...basePaymentData,
      back_urls: {
        success: urls.success,
        failure: urls.failure,
        pending: urls.pending
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [{ id: 'pix' }]
      }
    };

    // Só adicionar notification_url se não for localhost
    const isLocalhost = urls.notification.includes('localhost') || urls.notification.includes('127.0.0.1');
    if (!isLocalhost) {
      preferenceData.notification_url = urls.notification;
      console.log('🔔 Notification URL configurada:', urls.notification);
    } else {
      console.log('⚠️ Webhook desabilitado para localhost - use ngrok para testar webhooks');
    }

    console.log('📋 Dados da preferência:', {
      items: preferenceData.items.length,
      notification_url: preferenceData.notification_url,
      external_reference: preferenceData.external_reference,
      payer_identification: preferenceData.payer.identification
    });

    const result = await preference.create({ body: preferenceData });

    console.log('✅ Preferência criada:', result.id);

    // Verificar se a preferência foi criada
    if (!result.id) {
      throw new Error('Falha ao criar preferência de pagamento');
    }

    res.json({
      preference_id: result.id,
      init_point: result.init_point || result.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    
    // Mapear erros conhecidos
    let statusCode = 500;
    let errorMessage = 'Erro interno no processamento de pagamento';
    
    if (error.message.includes('FRONTEND_URL')) {
      statusCode = 500;
      errorMessage = 'Configuração de URL inválida - Verifique FRONTEND_URL no servidor';
    } 
    else if (error.message.includes('BACKEND_URL')) {
      statusCode = 500;
      errorMessage = 'Configuração de URL inválida - Verifique BACKEND_URL no servidor';
    }
    else if (error.message.includes('QR Code')) {
      statusCode = 400;
      errorMessage = 'Falha na geração do PIX - Tente novamente';
    }
    else if (error.response?.status === 400) {
      statusCode = 400;
      errorMessage = 'Dados de pagamento inválidos: ' + 
        (error.response.data.cause?.map(c => c.description).join(', ') || error.message);
    }
    else if (error.message.includes('access_token')) {
      statusCode = 401;
      errorMessage = 'Credenciais do Mercado Pago inválidas - Contate o suporte';
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Processar pagamento com cartão
const processCardPayment = async (req, res) => {
  try {
    const { preference_id, card_data, installments } = req.body;

    // Validar entrada
    if (!preference_id || !card_data) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'preference_id e card_data são obrigatórios'
      });
    }

    // Buscar dados da preferência
    const preferenceData = await preference.get({ id: preference_id });
    const totalAmount = preferenceData.items.reduce(
      (sum, item) => sum + (item.unit_price * item.quantity), 
      0
    );

    // Criar payload para pagamento com cartão
    const paymentPayload = {
      transaction_amount: totalAmount,
      token: card_data.token, // Em produção usar tokenização real
      description: 'Inscrição Festival de Ballet',
      installments: installments || 1,
      payment_method_id: card_data.number.startsWith('4') ? 'visa' : 'master',
      payer: {
        email: preferenceData.payer.email,
        identification: preferenceData.payer.identification
      },
      metadata: {
        festival_registration: true,
        user_document: preferenceData.payer.identification.number
      }
    };

    // Só adicionar notification_url se não for localhost
    const notificationUrl = `${getBackendUrl()}/api/payment/webhook`;
    const isLocalhost = notificationUrl.includes('localhost') || notificationUrl.includes('127.0.0.1');
    if (!isLocalhost) {
      paymentPayload.notification_url = notificationUrl;
    }

    const result = await payment.create({ body: paymentPayload });

    res.json({
      payment_id: result.id,
      status: result.status,
      status_detail: result.status_detail
    });

  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
    
    let statusCode = 500;
    let errorMessage = 'Falha no processamento do cartão';

    if (error.response?.data?.cause) {
      statusCode = 400;
      errorMessage = error.response.data.cause
        .map(c => c.description)
        .join(', ');
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    const result = await payment.get({ id: paymentId });

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
      console.log(`📢 Webhook recebido para pagamento: ${paymentId}`);

      // Buscar detalhes do pagamento
      const paymentInfo = await payment.get({ id: paymentId });
      
      console.log('📋 Detalhes do pagamento:', {
        id: paymentInfo.id,
        status: paymentInfo.status,
        status_detail: paymentInfo.status_detail,
        external_reference: paymentInfo.external_reference,
        amount: paymentInfo.transaction_amount
      });

      // Aqui você implementaria:
      // 1. Buscar inscrição pelo external_reference
      // 2. Atualizar status conforme paymentInfo.status
      // 3. Salvar no banco de dados

      if (paymentInfo.status === 'approved') {
        console.log('✅ Pagamento aprovado - inscrição confirmada');
        // Exemplo: await updateRegistrationStatus(paymentInfo.external_reference, 'confirmada');
      } else if (paymentInfo.status === 'rejected') {
        console.warn('❌ Pagamento rejeitado - inscrição cancelada');
        // Exemplo: await updateRegistrationStatus(paymentInfo.external_reference, 'cancelada');
      }

      return res.status(200).send('OK');
    }

    res.status(200).send('Evento não processado');
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).send('Error');
  }
};

// Mock para desenvolvimento
const mockPaymentResponse = (method) => {
  const mockId = `mock_${Date.now()}`;
  
  if (method === 'pix') {
    return {
      payment_id: mockId,
      qr_code: '00020126360014BR.GOV.BCB.PIX0114+5567999999999520400005303986540410.005802BR5913FESTIVALBALLET6008BRASILIA62200521abc123def4567890123456304',
      qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
  }
  
  return {
    preference_id: `pref_${mockId}`,
    init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=' + mockId
  };
};

module.exports = {
  createPaymentPreference,
  processCardPayment,
  checkPaymentStatus,
  handleWebhook
};