'use strict';

import http from 'http';
import app from './app';
import mongoose from 'mongoose';

// Create HTTP server.
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Database connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
mongoose.connect('mongodb://localhost/tocapu');

// Event listener for HTTP server "error" event.
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  const messages = {
    EACCES: `${bind} requires elevated privileges`,
    EADDRINUSE: `${bind} is already in use`,
    EBADCSRFTOKEN: `${bind} form tampered with CSRF`
  };

  // Handle specific listen errors with friendly messages
  if (messages[error.code]) {
    console.error(messages[error.code]);
    process.exit(1);
  } else {
    throw error;
  }
}

// Event listener for HTTP server "listening" event.
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  console.log(`Server listening on ${bind}`);
}

// Listen on provided port, on all network interfaces.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
