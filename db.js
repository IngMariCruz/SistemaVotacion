// Base de datos temporal en memoria
class Database {
  constructor() {
    this.reset();
  }

  reset() {
    // Estructura de la base de datos
    this.topics = []; // {id, title, votes}
    this.participants = []; // {id, name, hasVoted, votedFor}
    this.votingOpen = false;
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // TEMAS
  addTopic(title) {
    const topic = {
      id: this.topics.length + 1,
      title: title,
      votes: 0
    };
    this.topics.push(topic);
    return topic;
  }

  getTopics() {
    return this.topics;
  }

  clearTopics() {
    this.topics = [];
  }

  // PARTICIPANTES
  registerParticipant(participantId) {
    // Verificar si ya existe
    const existing = this.participants.find(p => p.id === participantId);
    if (existing) {
      return existing;
    }

    // Verificar límite de 30 participantes
    if (this.participants.length >= 30) {
      throw new Error('Límite de 30 participantes alcanzado');
    }

    const participant = {
      id: participantId,
      hasVoted: false,
      votedFor: null,
      timestamp: Date.now()
    };
    this.participants.push(participant);
    return participant;
  }

  getParticipant(participantId) {
    return this.participants.find(p => p.id === participantId);
  }

  // VOTACIÓN
  openVoting() {
    if (this.topics.length === 0) {
      throw new Error('No hay temas para votar');
    }
    this.votingOpen = true;
  }

  closeVoting() {
    this.votingOpen = false;
  }

  isVotingOpen() {
    return this.votingOpen;
  }

  vote(participantId, topicId) {
    const participant = this.getParticipant(participantId);
    
    if (!participant) {
      throw new Error('Participante no registrado');
    }

    if (!this.votingOpen) {
      throw new Error('La votación está cerrada');
    }

    if (participant.hasVoted) {
      throw new Error('Ya has votado');
    }

    const topic = this.topics.find(t => t.id === topicId);
    if (!topic) {
      throw new Error('Tema no encontrado');
    }

    // Registrar el voto
    topic.votes++;
    participant.hasVoted = true;
    participant.votedFor = topicId;

    return {
      success: true,
      topic: topic.title
    };
  }

  // RESULTADOS
  getResults() {
    return {
      topics: this.topics,
      totalVotes: this.topics.reduce((sum, t) => sum + t.votes, 0),
      totalParticipants: this.participants.length,
      votingOpen: this.votingOpen
    };
  }

  // ESTADÍSTICAS
  getStats() {
    return {
      totalTopics: this.topics.length,
      totalParticipants: this.participants.length,
      totalVotes: this.topics.reduce((sum, t) => sum + t.votes, 0),
      participantsWhoVoted: this.participants.filter(p => p.hasVoted).length,
      votingOpen: this.votingOpen
    };
  }
}

module.exports = new Database();