const signals = {
  // client-sent signals
  client: {
    hostGame: 'host-game',
    deleteHostedGame: 'delete-hosted-game',
    joinGame: 'join-game',
    checkForActiveGame: 'check-for-active-game',
    getRefresh: 'get-refresh',
    startGame: 'start-game',
    inputMove: 'input-move',
    inputWord: 'input-word',
    getAnalysis: 'get-analysis',
    requestRematch: 'request-rematch',
    acceptRematch: 'accept-rematch',
    leaveGame: 'leave-game',
  },

  // server-sent signals
  server: {
    gameJoined: 'game-joined',
    sentRefresh: 'sent-refresh',
    wordUpdated: 'word-updated',
    wordAccepted: 'word-accepted',
    rewardEnded: 'reward-ended',
    penaltyEnded: 'penalty-ended',
    timeUpdated: 'time-updated',
    gameEnded: 'game-ended',
    analysisSent: 'analysis-sent',
    rematchRequested: 'rematch-requested',
    gameReset: 'game-reset',
    opponentDisconnected: 'opponent-disconnected',
    activeGameFound: 'active-game-found',
  },
}

export default signals