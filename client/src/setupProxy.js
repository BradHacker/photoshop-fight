const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(createProxyMiddleware('/api', { target: 'http://server:8080' }));
  app.use(createProxyMiddleware('/socket.io', { target: 'http://server:8080', ws: true }));
};
