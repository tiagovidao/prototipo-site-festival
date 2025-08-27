const express = require('express');
const router = express.Router();

const eventsController = require('../controllers/eventsController');
const registrationsController = require('../controllers/registrationsController');
const contactsController = require('../controllers/contactsController');

router.get('/events', async (req, res) => {
  try {
    if (eventsController && eventsController.getEvents) {
      await eventsController.getEvents(req, res);
    } else {
      res.status(500).json({ 
        error: 'Controller de eventos não disponível',
        hint: 'Verifique se o eventsController foi atualizado'
      });
    }
  } catch (error) {
    console.error('❌ Erro na rota /events:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

router.get('/events/filter', async (req, res) => {
  try {
    if (eventsController && eventsController.getEventsByFilter) {
      await eventsController.getEventsByFilter(req, res);
    } else {
      res.status(500).json({ error: 'Controller de filtros não disponível' });
    }
  } catch (error) {
    console.error('❌ Erro na rota /events/filter:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

router.get('/events/:id', async (req, res) => {
  try {
    if (eventsController && eventsController.getEventById) {
      await eventsController.getEventById(req, res);
    } else {
      res.status(500).json({ error: 'Controller de evento específico não disponível' });
    }
  } catch (error) {
    console.error('❌ Erro na rota /events/:id:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

router.get('/events/stats', async (req, res) => {
  try {
    if (eventsController && eventsController.getFestivalStats) {
      await eventsController.getFestivalStats(req, res);
    } else {
      res.status(500).json({ error: 'Controller de estatísticas não disponível' });
    }
  } catch (error) {
    console.error('❌ Erro na rota /events/stats:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
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
    console.error('❌ Erro na rota /registrations/validate:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
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
    console.error('❌ Erro na rota /registrations:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

router.get('/registrations', async (req, res) => {
  try {
    if (registrationsController && registrationsController.getRegistrations) {
      await registrationsController.getRegistrations(req, res);
    } else {
      res.status(500).json({ error: 'Controller de listagem não disponível' });
    }
  } catch (error) {
    console.error('❌ Erro na rota GET /registrations:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

router.put('/registrations/:id/status', async (req, res) => {
  try {
    if (registrationsController && registrationsController.updateRegistrationStatus) {
      await registrationsController.updateRegistrationStatus(req, res);
    } else {
      res.status(500).json({ error: 'Controller de atualização não disponível' });
    }
  } catch (error) {
    console.error('❌ Erro na rota PUT /registrations/:id/status:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

router.get('/registrations/stats', async (req, res) => {
  try {
    if (registrationsController && registrationsController.getRegistrationStats) {
      await registrationsController.getRegistrationStats(req, res);
    } else {
      res.status(500).json({ error: 'Controller de estatísticas não disponível' });
    }
  } catch (error) {
    console.error('❌ Erro na rota /registrations/stats:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

router.post('/contacts', async (req, res) => {
  try {
    if (contactsController && contactsController.createContact) {
      await contactsController.createContact(req, res);
    } else {
      res.status(500).json({ error: 'Controller de contatos não disponível' });
    }
  } catch (error) {
    console.error('❌ Erro na rota /contacts:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

router.get('/admin/dashboard', async (req, res) => {
  try {
    // Buscar dados consolidados para o dashboard
    const [eventStats, regStats] = await Promise.all([
      eventsController.getFestivalStats ? 
        new Promise((resolve) => {
          eventsController.getFestivalStats({ query: {} }, {
            json: resolve,
            status: () => ({ json: resolve })
          });
        }) : Promise.resolve({}),
      registrationsController.getRegistrationStats ?
        new Promise((resolve) => {
          registrationsController.getRegistrationStats({ query: {} }, {
            json: resolve,
            status: () => ({ json: resolve })
          });
        }) : Promise.resolve({})
    ]);
    
    res.json({
      success: true,
      message: 'Dashboard FID BSB 2025',
      data: {
        evento: {
          nome: '2º Festival Internacional de Dança de Brasília',
          periodo: '16 a 18 de Outubro de 2025',
          local: 'Teatro Nacional Cláudio Santoro - Brasília/DF'
        },
        estatisticas: {
          eventos: eventStats,
          inscricoes: regStats
        },
        ultimaAtualizacao: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).json({ 
      error: 'Erro ao carregar dashboard',
      message: error.message 
    });
  }
});

router.get('/', (req, res) => {
  res.json({
    api: '2º Festival Internacional de Dança de Brasília',
    version: '2.0.0-fidbsb',
    timestamp: new Date().toISOString(),
    event_info: {
      name: '2º Festival Internacional de Dança de Brasília',
      dates: '16 a 18 de Outubro de 2025',
      location: 'Teatro Nacional Cláudio Santoro - Brasília/DF',
      organizers: ['Ministério do Turismo', 'Instituto Futuro Certo']
    },
    available_routes: {
      eventos: [
        'GET /api/events - Listar todos os eventos disponíveis',
        'GET /api/events/filter?estilo=X&modalidade=Y - Filtrar eventos',
        'GET /api/events/:id - Buscar evento específico',
        'GET /api/events/stats - Estatísticas do festival'
      ],
      inscricoes: [
        'POST /api/registrations/validate - Validar dados (documento/email)',
        'POST /api/registrations - Criar nova inscrição',
        'GET /api/registrations - Listar inscrições (admin)',
        'PUT /api/registrations/:id/status - Atualizar status (admin)',
        'GET /api/registrations/stats - Estatísticas de inscrições'
      ],
      administrativas: [
        'GET /api/admin/dashboard - Dashboard completo',
        'POST /api/contacts - Enviar mensagem de contato'
      ]
    },
    dance_styles: [
      'Ballet Clássico de Repertório',
      'Neoclássico',
      'Dança Contemporânea',
      'Jazz',
      'Danças Urbanas',
      'Danças Populares',
      'Danças Tradicionais',
      'Danças Livres'
    ],
    modalities: [
      'Solo', 'Duo', 'Trio', 'Conjunto',
      'Variação Feminina', 'Variação Masculina',
      'Pas de Deux', 'Grand Pas de Deux'
    ],
    age_categories: [
      'PRÉ (9 a 11 anos)',
      'JÚNIOR (12 a 14 anos)',
      'SENIOR (15 a 19 anos)',
      'AVANÇADO (20+ anos)'
    ]
  });
});

router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    availableRoutes: [
      'GET /api - Informações da API',
      'GET /api/events - Listar eventos',
      'POST /api/registrations - Criar inscrição',
      'POST /api/contacts - Enviar contato'
    ]
  });
});

router.use((error, req, res, next) => {
  console.error('🚨 Erro não tratado:', error);
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;