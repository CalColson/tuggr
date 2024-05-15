import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  const io = new Server(httpServer)

  // in-memory store for games
  const games = []

  io.on('connection', (socket) => {
    console.log(socket.id + ' connected')

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