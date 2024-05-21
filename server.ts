import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { GameListGame } from './app/types/GameListTypes'
import { HostGameArgs } from './app/types/HostGameArgs'
// js extension is required for ts-node/esm to work
import signals from './app/constants/strings/signals.js'

// remember to remove this
const TEST_GAME: GameListGame = {
  hostUsername: 'willing_chocolate_locust',
  rating: 1000,
  time: 30,
  isInProgress: true,
  hasGameStarted: false,
  currentWord: '',
  isHostsTurn: true,
  hostTime: 30,
  timerInterval: null,
  lastTimeUpdateTimestamp: 0
}

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  const io = new Server(httpServer)

  // in-memory store for games
  let games: GameListGame[] = [TEST_GAME]
  const DEFAULT_RATING = 1000
  // TODO: clear timer interval when game ends (or closes)

  function getOpenGames() {
    return games.filter(g => !g.isInProgress)
  }

  io.on('connection', (socket) => {
    console.log(socket.id + ' connected')

    socket.on(signals.client.getGames, () => {
      io.emit(signals.server.gamesSent, getOpenGames())
    })

    socket.on(signals.client.hostGame, (hostGameArgs: HostGameArgs) => {
      console.log(socket.id + ' hosted game with args:')
      console.dir(hostGameArgs)

      const game: GameListGame = {
        hostUsername: hostGameArgs.hostDisplayName,
        rating: DEFAULT_RATING,
        time: hostGameArgs.timeControl,
        isInProgress: false,
        hasGameStarted: false,
        currentWord: '',
        isHostsTurn: true,
        hostTime: hostGameArgs.timeControl,
        timerInterval: null,
        lastTimeUpdateTimestamp: 0
      }
      if (!games.some(g => g.hostUsername === game.hostUsername)) games.unshift(game)
      else {
        const newGames = games.filter(g => g.hostUsername !== game.hostUsername)
        newGames.unshift(game)
        games = newGames
      }

      socket.join(game.hostUsername)
      io.emit(signals.server.gameHosted, getOpenGames())
    })

    socket.on(signals.client.deleteHostedGame, (username) => {
      console.log(socket.id + ' deleted hosted game')
      games = games.filter(game => game.hostUsername !== username)
      io.emit(signals.server.gamesSent, getOpenGames())
    })

    socket.on(signals.client.joinGame, (hostUsername) => {
      socket.join(hostUsername)
      // console.log(io.sockets.adapter.rooms.get(hostUsername))
      const game = games.find(g => g.hostUsername === hostUsername)
      if (game) game.isInProgress = true
      io.emit(signals.server.gamesSent, getOpenGames())
      io.to(hostUsername).emit(signals.server.gameJoined, game)
    })

    socket.on(signals.client.ensureGameJoined, (hostUsername) => {
      socket.join(hostUsername)
      console.log(io.sockets.adapter.rooms.get(hostUsername))
    })

    socket.on(signals.client.startGame, () => {
      // TODO: time update seems stuck on sending 30 nonstop.... fix this
      const game = games.find(g => socket.rooms.has(g.hostUsername))
      if (game?.hasGameStarted) return
      if (game) {
        console.log(socket.id + ' started game')
        game.hasGameStarted = true
        game.lastTimeUpdateTimestamp = Date.now()
        game.timerInterval = setInterval(() => {
          const currentTime = Date.now()
          // time elapsed in seconds
          const timeElapsed = (currentTime - game.lastTimeUpdateTimestamp) / 1000
          // console.log('time elapsed: ' + timeElapsed)
          if (game.isHostsTurn) game.hostTime -= timeElapsed
          else game.hostTime += timeElapsed
          game.lastTimeUpdateTimestamp = currentTime
          if (game.hostTime <= 0 || game.hostTime >= game.time * 2) {
            if (game.timerInterval) clearInterval(game.timerInterval)
          }
          // console.log(game.hostTime)
          io.to(game.hostUsername).emit(signals.server.timeUpdated, game.hostTime)
        }, 20)
      }
    })

    socket.on(signals.client.inputMove, (move) => {
      const game = games.find(g => socket.rooms.has(g.hostUsername))
      // console.log(game)
      if (game) {
        game.currentWord += move
        game.isHostsTurn = !game.isHostsTurn
        io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn)
      }
    })

    socket.on('disconnecting', () => {
      // can still access the socket.rooms property here
    })
    socket.on('disconnect', () => {
      // can't access the socket.rooms property here (the rooms have been left already)
      console.log(socket.id + ' disconnected')
    })
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})