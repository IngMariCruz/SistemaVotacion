// Conexión Socket.io
const socket = io();

let participantId = null;
let hasVoted = false;
let selectedTopicId = null;
let topics = [];
let votingOpen = false;

// Elementos del DOM
const nameInput = document.getElementById('nameInput');
const registerSection = document.getElementById('registerSection');
const votingSection = document.getElementById('votingSection');
const waitingMessage = document.getElementById('waitingMessage');
const topicsSection = document.getElementById('topicsSection');
const successSection = document.getElementById('successSection');
const alreadyVotedSection = document.getElementById('alreadyVotedSection');
const topicsList = document.getElementById('topicsList');
const voteBtn = document.getElementById('voteBtn');
const messageDiv = document.getElementById('message');
const votingStatus = document.getElementById('votingStatus');
const votedTopicName = document.getElementById('votedTopicName');

// ============ FUNCIONES ============

function showMessage(text, type = 'info') {
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  messageDiv.classList.remove('hidden');
  
  setTimeout(() => {
    messageDiv.classList.add('hidden');
  }, 5000);
}

function generateParticipantId() {
  return 'participant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function register() {
  const name = nameInput.value.trim();
  
  if (!name) {
    showMessage('Por favor ingresa tu nombre', 'error');
    return;
  }
  
  // Generar ID único o recuperar del localStorage (en ambiente real)
  participantId = generateParticipantId();
  
  // Guardar el nombre para referencia
  sessionStorage.setItem('participantName', name);
  sessionStorage.setItem('participantId', participantId);
  
  // Registrar con el servidor
  socket.emit('participant:register', { participantId });
}

function renderTopics() {
  if (topics.length === 0) {
    topicsList.innerHTML = '<li style="text-align: center; color: #6b7280; padding: 20px;">No hay temas disponibles</li>';
    return;
  }
  
  topicsList.innerHTML = topics.map(topic => `
    <li class="topic-item" data-topic-id="${topic.id}" onclick="selectTopic(${topic.id})">
      <span class="topic-name">${topic.title}</span>
    </li>
  `).join('');
}

function selectTopic(topicId) {
  if (hasVoted) return;
  
  selectedTopicId = topicId;
  
  // Actualizar UI
  const items = document.querySelectorAll('.topic-item');
  items.forEach(item => {
    if (parseInt(item.dataset.topicId) === topicId) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  voteBtn.disabled = false;
}

function submitVote() {
  if (!selectedTopicId) {
    showMessage('Por favor selecciona un tema', 'error');
    return;
  }
  
  if (hasVoted) {
    showMessage('Ya has votado', 'error');
    return;
  }
  
  socket.emit('participant:vote', {
    participantId: participantId,
    topicId: selectedTopicId
  });
}

function updateVotingStatus(open) {
  votingOpen = open;
  
  if (open) {
    votingStatus.textContent = 'Votación Abierta';
    votingStatus.className = 'status-badge open';
    
    if (!hasVoted) {
      waitingMessage.classList.add('hidden');
      topicsSection.classList.remove('hidden');
    }
  } else {
    votingStatus.textContent = 'Votación Cerrada';
    votingStatus.className = 'status-badge closed';
    
    if (!hasVoted) {
      topicsSection.classList.add('hidden');
      waitingMessage.classList.remove('hidden');
    }
  }
}

// ============ SOCKET EVENTS ============

socket.on('connect', () => {
  console.log('Conectado al servidor');
  
  // Recuperar sesión si existe
  const savedId = sessionStorage.getItem('participantId');
  if (savedId) {
    participantId = savedId;
    socket.emit('participant:register', { participantId });
  }
});

socket.on('participant:registered', (data) => {
  hasVoted = data.participant.hasVoted;
  
  registerSection.classList.add('hidden');
  votingSection.classList.remove('hidden');
  
  if (hasVoted) {
    // Ya votó anteriormente
    waitingMessage.classList.add('hidden');
    topicsSection.classList.add('hidden');
    alreadyVotedSection.classList.remove('hidden');
  } else {
    // Aún no ha votado
    updateVotingStatus(data.votingOpen);
  }
  
  showMessage(`Bienvenido, ${sessionStorage.getItem('participantName')}!`, 'success');
});

socket.on('topics:updated', (data) => {
  topics = data;
  renderTopics();
});

socket.on('voting:statusChanged', (data) => {
  updateVotingStatus(data.open);
});

socket.on('participant:voteSuccess', (data) => {
  hasVoted = true;
  
  // Ocultar sección de votación
  topicsSection.classList.add('hidden');
  waitingMessage.classList.add('hidden');
  alreadyVotedSection.classList.add('hidden');
  
  // Mostrar éxito
  successSection.classList.remove('hidden');
  votedTopicName.textContent = `Has votado por: "${data.topic}"`;
  
  showMessage('¡Tu voto ha sido registrado exitosamente!', 'success');
});

socket.on('participant:error', (data) => {
  showMessage(data.message, 'error');
});

socket.on('system:reset', () => {
  sessionStorage.clear();
  location.reload();
});

// ============ EVENTOS DEL TECLADO ============

nameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    register();
  }
});