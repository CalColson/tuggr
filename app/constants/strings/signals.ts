const signals = {
  // client-sent signals
  client: {
    getGames: 'get-games',
    hostGame: 'host-game',
    deleteHostedGame: 'delete-hosted-game',
    joinGame: 'join-game',
    ensureGameJoined: 'ensure-game-joined',
  },

  // server-sent signals
  server: {
    gamesSent: 'games-sent',
    gameHosted: 'game-hosted',
    gameJoined: 'game-joined',
  }
}

export default signals