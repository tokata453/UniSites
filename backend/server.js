'use strict';
require('dotenv').config();

const http           = require('http');
const app            = require('./app');
const db             = require('./models');
const { initSocket } = require('./config/socket');

const PORT   = process.env.PORT || 3001;
const server = http.createServer(app); 

// Attach Socket.io to the HTTP server
initSocket(server);

const start = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅  Database connected');

    // if (process.env.NODE_ENV === 'development') {
    //   await db.sequelize.sync({ alter: true });
    //   console.log('✅  Models synced');
    // }

    server.listen(PORT, () => {
      console.log(`🚀  UniSites API running → http://localhost:${PORT}`);
      console.log(`📡  Socket.io ready`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err);
    process.exit(1);
  }
};

start();