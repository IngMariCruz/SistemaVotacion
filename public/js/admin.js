// Conexión Socket.io
const socket = io();

let votingOpen = false;
let topics = [];

// Elementos del DOM
const topicInput = document.getElementById('topicInput');
const topicsList = document.getElementById('topicsList');
const votingStatus = document.getElementById('votingStatus');
const messageDiv = document.getElementById('message');
const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');
const qrContainer = document.getElementById('qrContainer');
const qrImage = document.getElementById('qrImage');
const qrUrl = document.getElementById('qrUrl');

// Estadísticas
const statParticipants = document.getElementById('statParticipants');
const statVotes = document.getElementById('statVotes');
const statTopics = document.getElementById('statTopics');
const statVoted = document.getElementById('statVoted');

// ============ FUNCIONES ============

function showMessage(text, type = 'info') {
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  messageDiv.classList.remove('hidden');
  
  setTimeout(() => {
    messageDiv.classList.add('hidden');
  }, 5000);
}

function createTopic() {
  const title = topicInput.value.trim();
  
  if (!title) {
    showMessage('Por favor ingresa un nombre para el tema', 'error');
    return;
  }
  
  socket.emit('admin:createTopic', { title });
  topicInput.value = '';
}

function clearTopics() {
  if (confirm('¿Estás seguro de eliminar todos los temas?')) {
    socket.emit('admin:clearTopics');
  }
}

function openVoting() {
  if (topics.length === 0) {
    showMessage('Debes crear al menos un tema antes de abrir la votación', 'error');
    return;
  }
  
  socket.emit('admin:openVoting');
}

function closeVoting() {
  if (confirm('¿Estás seguro de cerrar la votación?')) {
    socket.emit('admin:closeVoting');
  }
}

function resetAll() {
  if (confirm('⚠️ Esto eliminará todos los datos (temas, votos, participantes). ¿Continuar?')) {
    socket.emit('admin:reset');
  }
}

function renderTopics() {
  if (topics.length === 0) {
    topicsList.innerHTML = '<li style="text-align: center; color: #6b7280; padding: 20px;">No hay temas creados</li>';
    return;
  }
  
  topicsList.innerHTML = topics.map(topic => `
    <li class="topic-item">
      <span class="topic-name">${topic.title}</span>
      <span class="vote-count">${topic.votes} votos</span>
    </li>
  `).join('');
}

function updateVotingStatus(open) {
  votingOpen = open;
  
  if (open) {
    votingStatus.textContent = 'Votación Abierta';
    votingStatus.className = 'status-badge open';
    openBtn.disabled = true;
    closeBtn.disabled = false;
    qrContainer.style.display = 'block';
  } else {
    votingStatus.textContent = 'Votación Cerrada';
    votingStatus.className = 'status-badge closed';
    openBtn.disabled = false;
    closeBtn.disabled = true;
  }
}

function updateStats(stats) {
  statParticipants.textContent = stats.totalParticipants;
  statVotes.textContent = stats.totalVotes;
  statTopics.textContent = stats.totalTopics;
  statVoted.textContent = stats.participantsWhoVoted;
}

// ============ SOCKET EVENTS ============

socket.on('connect', () => {
  console.log('Conectado al servidor');
  socket.emit('request:currentState');
  loadQRCode();
});

socket.on('topics:updated', (data) => {
  topics = data;
  renderTopics();
});

socket.on('voting:statusChanged', (data) => {
  updateVotingStatus(data.open);
});

socket.on('stats:updated', (data) => {
  updateStats(data);
});

socket.on('admin:topicCreated', (data) => {
  showMessage(`Tema "${data.topic.title}" creado exitosamente`, 'success');
});

socket.on('admin:topicsCleared', () => {
  showMessage('Todos los temas han sido eliminados', 'success');
});

socket.on('admin:votingOpened', () => {
  showMessage('¡Votación abierta! Los participantes ya pueden votar', 'success');
});

socket.on('admin:votingClosed', () => {
  showMessage('Votación cerrada. Los resultados están disponibles', 'success');
});

socket.on('admin:resetComplete', () => {
  showMessage('Sistema reseteado completamente', 'success');
  topics = [];
  renderTopics();
  updateVotingStatus(false);
  updateStats({
    totalParticipants: 0,
    totalVotes: 0,
    totalTopics: 0,
    participantsWhoVoted: 0
  });
});

socket.on('admin:error', (data) => {
  showMessage(data.message, 'error');
});

socket.on('system:reset', () => {
  location.reload();
});

// ============ CARGAR QR ============

async function loadQRCode() {
  try {
    const response = await fetch('/api/qr');
    const data = await response.json();
    qrImage.src = data.qrCode;
    qrUrl.textContent = data.url;
  } catch (error) {
    console.error('Error cargando QR:', error);
  }
}

// ============ EVENTOS DEL TECLADO ============

topicInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    createTopic();
  }
});

// Inicializar
renderTopics();