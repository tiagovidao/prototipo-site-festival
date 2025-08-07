// backend/src/routes/index.js - ATUALIZADO
const express = require('express');
const router = express.Router();

// Importar controllers de forma segura
let eventsController, registrationsController, contactController, donationsController, adminController, paymentController;

try {
  eventsController = require('../controllers/eventsController');
  registrationsController = require('../controllers/registrationsController');
  contactController = require('../controllers/contactController');
  donationsController = require('../controllers/donationsController');
  adminController = require('../controllers/adminController');
  paymentController = require('../controllers/paymentController'); // NOVO
} catch (error) {
  console.error('Erro ao importar controllers:', error.message);
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

// Eventos
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

// Inscrições
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

// Contatos
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

// Doações
router.post('/donations', async (req, res) => {
  try {
    if (donationsController && donationsController.createDonation) {
      await donationsController.createDonation(req, res);
    } else {
      res.status(500).json({ error: 'Controller de doações não disponível' });
    }
  } catch (error) {
    console.error('Erro na rota /donations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// === ROTAS DE PAGAMENTO (NOVO) ===

// Criar preferência de pagamento
router.post('/payment/create-preference', async (req, res) => {
  try {
    if (paymentController && paymentController.createPaymentPreference) {
      await paymentController.createPaymentPreference(req, res);
    } else {
      // Fallback simples para testes sem Mercado Pago
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

// Processar pagamento com cartão
router.post('/payment/process-card', async (req, res) => {
  try {
    if (paymentController && paymentController.processCardPayment) {
      await paymentController.processCardPayment(req, res);
    } else {
      // Mock para testes
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

// Verificar status do pagamento
router.get('/payment/check/:paymentId', async (req, res) => {
  try {
    if (paymentController && paymentController.checkPaymentStatus) {
      await paymentController.checkPaymentStatus(req, res);
    } else {
      // Mock para testes - simular aprovação após 10 segundos
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

// Webhook do Mercado Pago
router.post('/payment/webhook', async (req, res) => {
  try {
    if (paymentController && paymentController.handleWebhook) {
      await paymentController.handleWebhook(req, res);
    } else {
      console.log('📢 Webhook recebido:', req.body);
      res.status(200).send('OK');
    }
  } catch (error) {
    console.error('Erro na rota /payment/webhook:', error);
    res.status(500).send('Error');
  }
});

// === ROTAS ADMINISTRATIVAS (com autenticação básica) ===

// Dashboard administrativo
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

// Listar todas as inscrições
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

// Atualizar status de inscrição
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

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString(),
    routes: [
      'GET /api/events',
      'POST /api/registrations',
      'POST /api/contacts',
      'POST /api/donations',
      'POST /api/payment/create-preference',
      'POST /api/payment/process-card',
      'GET /api/payment/check/:paymentId',
      'POST /api/payment/webhook',
      'GET /admin/dashboard (autenticação necessária)',
      'GET /admin/registrations (autenticação necessária)',
      'PUT /admin/registrations/:id/status (autenticação necessária)'
    ]
  });
});

module.exports = router;