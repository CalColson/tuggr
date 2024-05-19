import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { GameListGame } from './app/types/GameListTypes'
import { HostGameArgs } from './app/types/HostGameArgs'
// js extension is required for ts-node/esm to work
import signals from './app/constants/strings/signals.js'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  const io = new Server(httpServer)

  // in-memory store for games
  let games: GameListGame[] = []
  const DEFAULT_RATING = 1000
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
        hostSocketId: socket.id,
        rating: DEFAULT_RATING,
        time: hostGameArgs.timeControl,
        isInProgress: false,
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