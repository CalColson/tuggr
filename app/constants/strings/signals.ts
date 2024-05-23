const signals = {
  // client-sent signals
  client: {
    getGames: 'get-games',
    hostGame: 'host-game',
    deleteHostedGame: 'delete-hosted-game',
    joinGame: 'join-game',
    ensureGameJoined: 'ensure-game-joined',
    startGame: 'start-game',
    inputMove: 'input-move',
    inputWord: 'input-word',
  },

  // server-sent signals
  server: {
    gamesSent: 'games-sent',
    gameHosted: 'game-hosted',
    gameJoined: 'game-joined',
    wordUpdated: 'word-updated',
    wordAccepted: 'word-accepted',
    rewardEnded: 'reward-ended',
    penaltyEnded: 'penalty-ended',
    timeUpdated: 'time-updated',
    gameEnded: 'game-ended',
  }
}

export default signals