// backend/src/routes/index.js - ATUALIZADO (removendo rotas de doações)
const express = require('express');
const router = express.Router();

// Importar controllers de forma segura
let eventsController, registrationsController, contactController, adminController, paymentController;

try {
  eventsController = require('../controllers/eventsController');
  registrationsController = require('../controllers/registrationsController');
  contactController = require('../controllers/contactController');
  adminController = require('../controllers/adminController');
  paymentController = require('../controllers/paymentController');
  console.log('✅ Controllers carregados com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar controllers:', error.message);
}

// Middleware de logging para debug
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware básico de autenticação para rotas admin
const basicAuth = (req, res, next) => {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const provided = req.headers.authorization?.replace('Basic ', '');
  
  if (provided) {
    const decoded = Buffer.from(provided, 'base64').toString();
    const [username, password] = decoded.split(':');
    
    if (username === 'admin' && password === adminPassword) {
      return next();
    }
  }
  
  res.status(401).json({ error: 'Autenticação necessária' });
};

// === ROTAS PÚBLICAS ===

// Eventos - GET /api/events
router.get('/events', async (req, res) => {
  try {
    if (eventsController && eventsController.getEvents) {
      await eventsController.getEvents(req, res);
    } else {
      res.status(500).json({ error: 'Controller de eventos não disponível' });
    }
  } catch (error) {
    console.error('Erro na rota /events:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Validar dados de inscrição - POST /api/registrations/validate
router.post('/registrations/validate', async (req, res) => {
  try {
    if (registrationsController && registrationsController.validateRegistrationData) {
      await registrationsController.validateRegistrationData(req, res);
    } else {
      res.status(500).json({ error: 'Controller de validação não disponível' });
    }
  } catch (error) {
    console.error('Erro na rota /registrations/validate:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar inscrição - POST /api/registrations
router.post('/registrations', async (req, res) => {
  try {
    if (registrationsController && registrationsController.createRegistration) {
      await registrationsController.createRegistration(req, res);
    } else {
      res.status(500).json({ error: 'Controller de inscrições não disponível' });
    }
  } catch (error) {
    console.error('Erro na rota /registrations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Contatos - POST /api/contacts
router.post('/contacts', async (req, res) => {
  try {
    if (contactController && contactController.createContact) {
      await contactController.createContact(req, res);
    } else {
      res.status(500).json({ error: 'Controller de contatos não disponível' });
    }
  } catch (error) {
    console.error('Erro na rota /contacts:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// === ROTAS DE PAGAMENTO ===

// Criar preferência de pagamento - POST /api/payment/create-preference
router.post('/payment/create-preference', async (req, res) => {
  try {
    if (paymentController && paymentController.createPaymentPreference) {
      await paymentController.createPaymentPreference(req, res);
    } else {
      // Fallback simples para testes sem Mercado Pago
      console.log('⚠️ Controller de pagamento não disponível, usando mock');
      const { paymentData, method } = req.body;
      const mockPaymentId = `mock_${Date.now()}`;
      
      if (method === 'pix') {
        res.json({
          payment_id: mockPaymentId,
          qr_code: 'mock_pix_code_123456789',
          qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        });
      } else {
        res.json({
          preference_id: `pref_${mockPaymentId}`,
          init_point: 'https://mercadopago.com/mock'
        });
      }
    }
  } catch (error) {
    console.error('Erro na rota /payment/create-preference:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Processar pagamento com cartão - POST /api/payment/process-card
router.post('/payment/process-card', async (req, res) => {
  try {
    if (paymentController && paymentController.processCardPayment) {
      await paymentController.processCardPayment(req, res);
    } else {
      // Mock para testes
      console.log('⚠️ Controller de pagamento não disponível, usando mock');
      const mockPaymentId = `card_${Date.now()}`;
      setTimeout(() => {
        res.json({
          payment_id: mockPaymentId,
          status: 'approved',
          status_detail: 'accredited'
        });
      }, 2000); // Simular processamento
    }
  } catch (error) {
    console.error('Erro na rota /payment/process-card:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar status do pagamento - GET /api/payment/check/:paymentId
router.get('/payment/check/:paymentId', async (req, res) => {
  try {
    if (paymentController && paymentController.checkPaymentStatus) {
      await paymentController.checkPaymentStatus(req, res);
    } else {
      // Mock para testes - simular aprovação após 10 segundos
      console.log('⚠️ Controller de pagamento não disponível, usando mock');
      const { paymentId } = req.params;
      const isOld = Date.now() - parseInt(paymentId.split('_')[1]) > 10000;
      
      res.json({
        payment_id: paymentId,
        status: isOld ? 'approved' : 'pending',
        status_detail: isOld ? 'accredited' : 'pending_payment'
      });
    }
  } catch (error) {
    console.error('Erro na rota /payment/check:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook do Mercado Pago - POST /api/payment/webhook
router.post('/payment/webhook', async (req, res) => {
  try {
    if (paymentController && paymentController.handleWebhook) {
      await paymentController.handleWebhook(req, res);
    } else {
      console.log('📢 Webhook recebido (mock):', req.body);
      res.status(200).send('OK');
    }
  } catch (error) {
    console.error('Erro na rota /payment/webhook:', error);
    res.status(500).send('Error');
  }
});

// === ROTAS ADMINISTRATIVAS (com autenticação básica) ===

// Dashboard administrativo - GET /api/admin/dashboard
router.get('/admin/dashboard', basicAuth, async (req, res) => {
  try {
    if (adminController && adminController.getAdminDashboard) {
      await adminController.getAdminDashboard(req, res);
    } else {
      res.status(500).json({ error: 'Controller admin não disponível' });
    }
  } catch (error) {
    console.error('Erro na rota /admin/dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todas as inscrições - GET /api/admin/registrations
router.get('/admin/registrations', basicAuth, async (req, res) => {
  try {
    if (registrationsController && registrationsController.getRegistrations) {
      await registrationsController.getRegistrations(req, res);
    } else {
      res.status(500).json({ error: 'Controller de inscrições não disponível' });
    }
  } catch (error) {
    console.error('Erro na rota /admin/registrations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status de inscrição - PUT /api/admin/registrations/:id/status
router.put('/admin/registrations/:id/status', basicAuth, async (req, res) => {
  try {
    if (registrationsController && registrationsController.updateRegistrationStatus) {
      await registrationsController.updateRegistrationStatus(req, res);
    } else {
      res.status(500).json({ error: 'Controller de inscrições não disponível' });
    }
  } catch (error) {
    console.error('Erro na rota /admin/registrations/:id/status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de teste - GET /api/test
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API Festival de Ballet funcionando!', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    available_routes: [
      'GET /api/events - Listar eventos disponíveis',
      'POST /api/registrations/validate - Validar dados de inscrição',
      'POST /api/registrations - Criar nova inscrição',
      'POST /api/contacts - Enviar mensagem de contato',
      'POST /api/payment/create-preference - Criar pagamento (PIX/Cartão)',
      'POST /api/payment/process-card - Processar cartão de crédito',
      'GET /api/payment/check/:paymentId - Verificar status pagamento',
      'POST /api/payment/webhook - Webhook Mercado Pago',
      '--- ROTAS ADMINISTRATIVAS (autenticação necessária) ---',
      'GET /api/admin/dashboard - Dashboard administrativo',
      'GET /api/admin/registrations - Listar inscrições',
      'PUT /api/admin/registrations/:id/status - Atualizar status'
    ],
    removed_routes: [
      'POST /api/donations - REMOVIDO (funcionalidade descontinuada)'
    ]
  });
});

module.exports = router;