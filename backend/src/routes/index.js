const express = require('express');
const router = express.Router();

// Importar controllers de forma segura
let eventsController, registrationsController, contactController, donationsController;

try {
  eventsController = require('../controllers/eventsController');
  registrationsController = require('../controllers/registrationsController');
  contactController = require('../controllers/contactController');
  donationsController = require('../controllers/donationsController');
} catch (error) {
  console.error('Erro ao importar controllers:', error.message);
}

// Middleware de logging para debug
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas com tratamento de erro
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

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString(),
    routes: [
      'GET /api/events',
      'POST /api/registrations',
      'POST /api/contacts',
      'POST /api/donations'
    ]
  });
});

module.exports = router;