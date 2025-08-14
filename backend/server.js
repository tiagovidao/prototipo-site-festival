require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// 🌍 CORS configurado para Render + Netlify + Vercel
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://festival-admin.netlify.app',
  'https://festival-admin.onrender.com',
  'https://prototipo-site-festival-7gln.vercel.app',
  'https://prototipo-site-festival.vercel.app', 
  'https://prototipo-site-festival-7gln-git-main.vercel.app',
  'https://prototipo-site-festival-7gln-git-desenvolvimento.vercel.app',
  'https://prototipo-site-festival-git-desenvolvimento.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGINS?.split(',') || []
].flat().filter(Boolean);

console.log('🌍 CORS Origins permitidas:', allowedOrigins);

// Middlewares básicos
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Para permitir requests do frontend
}));

app.use(morgan('combined'));

// 🔧 CORS robusta para produção - MELHORADA
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar se o origin está na lista permitida
    if (allowedOrigins.some(allowed => 
      origin === allowed || 
      origin.startsWith(allowed) ||
      (allowed.includes('netlify.app') && origin.includes('netlify.app')) ||
      (allowed.includes('onrender.com') && origin.includes('onrender.com')) ||
      // 🆕 WILDCARD PARA VERCEL
      (allowed.includes('vercel.app') && origin.includes('vercel.app') && origin.includes('prototipo-site-festival'))
    )) {
      return callback(null, true);
    }
    
    console.warn('❌ CORS bloqueado para origin:', origin);
    console.warn('📋 Origins permitidas:', allowedOrigins);
    callback(new Error('Não permitido pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 horas de cache para preflight
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// 🩺 Health check - ANTES das rotas principais
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Servidor Festival de Ballet funcionando!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors_origins: allowedOrigins.length,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// 🔧 Endpoint específico para testar CORS
app.get('/cors-test', (req, res) => {
  res.json({
    message: 'CORS funcionando!',
    origin: req.headers.origin,
    allowed: true,
    timestamp: new Date().toISOString()
  });
});

// 🔧 Endpoint para debug de CORS
app.get('/debug/cors', (req, res) => {
  res.json({
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer,
    timestamp: new Date().toISOString()
  });
});

// 🚀 Importar e usar rotas
try {
  const routes = require('./src/routes/index');
  app.use('/api', routes);
  console.log('✅ Rotas carregadas com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar rotas:', error.message);
  
  // Rota de fallback se as rotas principais falharem
  app.use('/api', (req, res) => {
    res.status(503).json({
      error: 'Rotas não disponíveis',
      message: 'Sistema em manutenção',
      timestamp: new Date().toISOString()
    });
  });
}

// 🛡️ Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err.stack);
  
  // CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Origin não permitida',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({ 
    error: 'Algo deu errado!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// 📍 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    available_routes: [
      'GET /health',
      'GET /cors-test',
      'GET /debug/cors',
      'POST /api/admin/login',
      'GET /api/admin/dashboard'
    ]
  });
});

// 🚀 Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 =======================================');
  console.log(`🎭 Festival de Ballet - Backend v1.0.0`);
  console.log(`🌐 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS Origins: ${allowedOrigins.length} configuradas`);
  console.log('🚀 =======================================');
  
  // Log das origins para debug
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 CORS Origins detalhadas:');
    allowedOrigins.forEach((origin, i) => {
      console.log(`   ${i + 1}. ${origin}`);
    });
  }
});

// 🛡️ Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} recebido, encerrando servidor graciosamente...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Erro ao fechar servidor:', err);
      process.exit(1);
    }
    
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
  
  // Force close após 10 segundos
  setTimeout(() => {
    console.error('❌ Forçando encerramento após timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 🚨 Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;