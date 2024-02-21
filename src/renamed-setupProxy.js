import { API_URL } from './config'
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/',
    createProxyMiddleware({
      target: API_URL, // Altere para a URL da sua API
      changeOrigin: true,
    })
  );
};
