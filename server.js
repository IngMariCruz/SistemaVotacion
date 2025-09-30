const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Generar URL del participante con QR
function generateParticipantUrl(req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/participant.html`;
}

// ============ RUTAS HTTP ============

// Generar QR para participantes
app.get('/api/qr', async (req, res) => {
  try {
    const url = generateParticipantUrl(req);
    const qrCode = await QRCode.toDataURL(url);
    res.json({ qrCode, url });
  } catch (error) {
    res.status(500).json({ error: 'Error generando QR' });
  }
});

// Obtener temas
app.get('/api/topics', (req, res) => {
  res.json(db.getTopics());
});

// Obtener resultados
app.get('/api/results', (req, res) => {
  res.json(db.getResults());
});

// Obtener estadísticas
app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

// ============ WEBSOCKET HANDLERS ============

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // ADMIN - Crear tema
  socket.on('admin:createTopic', (data) => {
    try {
      const topic = db.addTopic(data.title);
      io.emit('topics:updated', db.getTopics());
      socket.emit('admin:topicCreated', { success: true, topic });
    } catch (error) {
      socket.emit('admin:error', { message: error.message });
    }
  });

  // ADMIN - Limpiar temas
  socket.on('admin:clearTopics', () => {
    db.clearTopics();
    io.emit('topics:updated', db.getTopics());
    socket.emit('admin:topicsCleared', { success: true });
  });

  // ADMIN - Abrir votación
  socket.on('admin:openVoting', () => {
    try {
      db.openVoting();
      io.emit('voting:statusChanged', { open: true });
      socket.emit('admin:votingOpened', { success: true });
    } catch (error) {
      socket.emit('admin:error', { message: error.message });
    }
  });

  // ADMIN - Cerrar votación
  socket.on('admin:closeVoting', () => {
    db.closeVoting();
    io.emit('voting:statusChanged', { open: false });
    io.emit('results:updated', db.getResults());
    socket.emit('admin:votingClosed', { success: true });
  });

  // ADMIN - Resetear todo
  socket.on('admin:reset', () => {
    db.reset();
    io.emit('system:reset');
    socket.emit('admin:resetComplete', { success: true });
  });

  // PARTICIPANTE - Registrar
  socket.on('participant:register', (data) => {
    try {
      const participant = db.registerParticipant(data.participantId);
      socket.emit('participant:registered', { 
        success: true, 
        participant,
        votingOpen: db.isVotingOpen()
      });
      
      // Enviar temas si la votación está abierta
      if (db.isVotingOpen()) {
        socket.emit('topics:updated', db.getTopics());
      }

      // Actualizar estadísticas
      io.emit('stats:updated', db.getStats());
    } catch (error) {
      socket.emit('participant:error', { message: error.message });
    }
  });

  // PARTICIPANTE - Votar
  socket.on('participant:vote', (data) => {
    try {
      const result = db.vote(data.participantId, data.topicId);
      socket.emit('participant:voteSuccess', result);
      
      // Actualizar resultados para todos
      io.emit('results:updated', db.getResults());
      io.emit('stats:updated', db.getStats());
    } catch (error) {
      socket.emit('participant:error', { message: error.message });
    }
  });

  // Solicitar estado actual
  socket.on('request:currentState', () => {
    socket.emit('topics:updated', db.getTopics());
    socket.emit('voting:statusChanged', { open: db.isVotingOpen() });
    socket.emit('results:updated', db.getResults());
    socket.emit('stats:updated', db.getStats());
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Panel Admin: http://localhost:${PORT}/admin.html`);
  console.log(`Participantes: http://localhost:${PORT}/participant.html`);
});