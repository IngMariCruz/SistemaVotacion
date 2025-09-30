// Conexión Socket.io
const socket = io();

let results = null;

// Elementos del DOM
const votingStatus = document.getElementById('votingStatus');
const totalVotes = document.getElementById('totalVotes');
const totalParticipants = document.getElementById('totalParticipants');
const chartBars = document.getElementById('chartBars');
const noDataMessage = document.getElementById('noDataMessage');
const resultsTable = document.getElementById('resultsTable');

// ============ FUNCIONES ============

function updateVotingStatus(open) {
  if (open) {
    votingStatus.textContent = 'Votación Abierta';
    votingStatus.className = 'status-badge open';
  } else {
    votingStatus.textContent = 'Votación Cerrada';
    votingStatus.className = 'status-badge closed';
  }
}

function renderChart() {
  if (!results || results.topics.length === 0 || results.totalVotes === 0) {
    chartBars.innerHTML = '';
    noDataMessage.style.display = 'block';
    return;
  }

  noDataMessage.style.display = 'none';

  // Ordenar por votos (descendente)
  const sortedTopics = [...results.topics].sort((a, b) => b.votes - a.votes);

  // Encontrar el máximo de votos para escalar
  const maxVotes = Math.max(...sortedTopics.map(t => t.votes), 1);

  chartBars.innerHTML = sortedTopics.map(topic => {
    const percentage = results.totalVotes > 0 
      ? Math.round((topic.votes / results.totalVotes) * 100) 
      : 0;
    const width = (topic.votes / maxVotes) * 100;

    return `
      <div class="chart-bar">
        <div class="chart-bar-label">
          <span><strong>${topic.title}</strong></span>
          <span>${topic.votes} votos (${percentage}%)</span>
        </div>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill" style="width: ${width}%">
            ${topic.votes > 0 ? percentage + '%' : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTable() {
  if (!results || results.topics.length === 0) {
    resultsTable.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #6b7280; padding: 20px;">
          No hay datos disponibles
        </td>
      </tr>
    `;
    return;
  }

  // Ordenar por votos (descendente)
  const sortedTopics = [...results.topics].sort((a, b) => b.votes - a.votes);

  resultsTable.innerHTML = sortedTopics.map((topic, index) => {
    const percentage = results.totalVotes > 0 
      ? ((topic.votes / results.totalVotes) * 100).toFixed(1) 
      : '0.0';

    const rowStyle = index % 2 === 0 ? 'background: #f9fafb;' : '';

    return `
      <tr style="${rowStyle}">
        <td style="padding: 12px; color: #6b7280;">${index + 1}</td>
        <td style="padding: 12px; color: #333; font-weight: 500;">${topic.title}</td>
        <td style="padding: 12px; text-align: center; color: #667eea; font-weight: bold;">${topic.votes}</td>
        <td style="padding: 12px; text-align: center; color: #6b7280;">${percentage}%</td>
      </tr>
    `;
  }).join('');
}

function updateResults(data) {
  results = data;

  // Actualizar estadísticas
  totalVotes.textContent = data.totalVotes;
  totalParticipants.textContent = data.totalParticipants;

  // Actualizar gráfico y tabla
  renderChart();
  renderTable();

  // Animación suave
  chartBars.style.opacity = '0';
  setTimeout(() => {
    chartBars.style.transition = 'opacity 0.5s ease';
    chartBars.style.opacity = '1';
  }, 50);
}

function requestUpdate() {
  socket.emit('request:currentState');
}

// ============ SOCKET EVENTS ============

socket.on('connect', () => {
  console.log('Conectado al servidor');
  requestUpdate();
});

socket.on('results:updated', (data) => {
  updateResults(data);
});

socket.on('voting:statusChanged', (data) => {
  updateVotingStatus(data.open);
});

socket.on('system:reset', () => {
  location.reload();
});

// Auto-actualizar cada 3 segundos
setInterval(() => {
  requestUpdate();
}, 3000);