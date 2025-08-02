// src/routes/index.js
const express = require('express');
const router = express.Router();

// Importar controllers de forma segura
let eventsController, registrationsController, contactController, donationsController, adminController;

try {
  eventsController = require('../controllers/eventsController');
  registrationsController = require('../controllers/registrationsController');
  contactController = require('../controllers/contactController');
  donationsController = require('../controllers/donationsController');
  adminController = require('../controllers/adminController');
} catch (error) {
  console.error('Erro ao importar controllers:', error.message);
}

// Middleware de logging para debug
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware básico de autenticação para rotas admin (simples para teste)
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
      'GET /admin/dashboard (autenticação necessária)',
      'GET /admin/registrations (autenticação necessária)',
      'PUT /admin/registrations/:id/status (autenticação necessária)'
    ]
  });
});

module.exports = router;