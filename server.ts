import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { GameListGame } from './app/types/GameListTypes'
import { HostGameArgs } from './app/types/HostGameArgs'

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

  io.on('connection', (socket) => {
    console.log(socket.id + ' connected')

    socket.on('get-games', () => {
      io.emit('games-sent', games)
    })

    socket.on('host-game', (hostGameArgs: HostGameArgs) => {
      console.log(socket.id + ' hosted game with args:')
      console.dir(hostGameArgs)

      const game: GameListGame = {
        username: hostGameArgs.hostDisplayName,
        rating: DEFAULT_RATING,
        time: hostGameArgs.timeControl
      }
      if (!games.some(g => g.username === game.username)) games.unshift(game)
      else {
        const newGames = games.filter(g => g.username !== game.username)
        newGames.unshift(game)
        games = newGames
      }

      io.emit('game-hosted', games)
    })
    socket.on('join-game', (gameId) => {
      console.log(socket.id + ' joined game ' + gameId + '(not really)')
      // socket.join(gameId)
    })

    socket.on('disconnect', () => {
      console.log(socket.id + ' disconnected')
    })
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})