import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { GameListGame } from './app/types/GameListTypes'
import { HostGameArgs } from './app/types/HostGameArgs'
// js extension is required for ts-node/esm to work
import signals from './app/constants/strings/signals.js'
import { getWordList } from './utils/fileHandler.js'

// remember to remove this
// const TEST_GAME: GameListGame = {
//   hostUsername: 'willing_chocolate_locust',
//   rating: 1000,
//   time: 30,
//   isInProgress: true,
//   hasGameStarted: false,
//   currentWord: '',
//   isHostsTurn: true,
//   isBeingRewarded: false,
//   isBeingPenalized: false,
//   hostTime: 30,
//   timerInterval: null,
//   lastTimeUpdateTimestamp: 0
// }

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const wordList = getWordList()

const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  const io = new Server(httpServer)

  // in-memory store for games
  // let games: GameListGame[] = [TEST_GAME]
  let games: GameListGame[] = []
  const DEFAULT_RATING = 1000
  // the fraction of the time control to reward/penalize the player for a valid/invalid word
  // e.g. a value of 6 means the player will lose 1/6 of their starting time for an invalid word
  const DEFAULT_REWARD = 6
  const DEFAULT_PENALTY = 6
  // the time in seconds to freeze the game for after a reward/penalty
  const DEFAULT_REWARD_FREEZE_TIME = 1
  const DEFAULT_PENALTY_FREEZE_TIME = 1

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
        isBeingRewarded: false,
        isBeingPenalized: false,
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
            if (game.timerInterval) {
              clearInterval(game.timerInterval)
              game.timerInterval = null
              game.hostTime = game.hostTime <= 0 ? 0 : game.time * 2
              io.to(game.hostUsername).emit(signals.server.timeUpdated, game.hostTime)
              return
            }
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
        if (game.isBeingPenalized || game.isBeingRewarded) return
        game.currentWord += move
        const possibleWords = getPossibleWords(game.currentWord)
        // console.log(possibleWords)
        const isValid = possibleWords.length > 0
        if (isValid) {
          // only change turns if the word is valid
          game.isHostsTurn = !game.isHostsTurn
        } else {
          // penalize the player for an invalid word
          game.isBeingPenalized = true
          if (game.isHostsTurn) game.hostTime -= (game.time / DEFAULT_PENALTY) - DEFAULT_PENALTY_FREEZE_TIME
          else game.hostTime += (game.time / DEFAULT_PENALTY) - DEFAULT_PENALTY_FREEZE_TIME
          setTimeout(() => {
            game.currentWord = ''
            game.isBeingPenalized = false
            io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn, true)
            io.to(game.hostUsername).emit(signals.server.penaltyEnded)
          }, DEFAULT_PENALTY_FREEZE_TIME * 1000)
        }
        io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn, isValid)
      }
    })

    socket.on(signals.client.inputWord, () => {
      const game = games.find(g => socket.rooms.has(g.hostUsername))
      if (game) {
        if (game.isBeingPenalized || game.isBeingRewarded) return
        const isValid = wordList.includes(game.currentWord)
        if (isValid) {
          // reward the player for a valid word
          game.isBeingRewarded = true
          if (game.isHostsTurn) game.hostTime += (game.time / DEFAULT_REWARD) + DEFAULT_REWARD_FREEZE_TIME
          else game.hostTime -= (game.time / DEFAULT_REWARD) + DEFAULT_REWARD_FREEZE_TIME

          io.to(game.hostUsername).emit(signals.server.wordAccepted)
          setTimeout(() => {
            game.currentWord = ''
            game.isBeingRewarded = false
            io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn, true)
            io.to(game.hostUsername).emit(signals.server.rewardEnded)
          }, DEFAULT_REWARD_FREEZE_TIME * 1000)
        } else {
          // penalize the player for an invalid word
          game.isBeingPenalized = true
          if (game.isHostsTurn) game.hostTime -= (game.time / DEFAULT_PENALTY) - DEFAULT_PENALTY_FREEZE_TIME
          else game.hostTime += (game.time / DEFAULT_PENALTY) - DEFAULT_PENALTY_FREEZE_TIME
          io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn, false)
          setTimeout(() => {
            game.currentWord = ''
            game.isBeingPenalized = false
            io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn, true)
            io.to(game.hostUsername).emit(signals.server.penaltyEnded)
          }, DEFAULT_PENALTY_FREEZE_TIME * 1000)

        }
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

function getPossibleWords(word: string): string[] {
  return wordList.filter(w => w.startsWith(word))
}