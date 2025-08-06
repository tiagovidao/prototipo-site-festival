// backend/src/middleware/security.js
const rateLimit = require('express-rate-limit');

const paymentLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de pagamento
  message: 'Muitas tentativas de pagamento'
});

module.exports = { paymentLimit };