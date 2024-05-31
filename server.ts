import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { GameListGame } from './app/types/GameListTypes'
import { HostGameArgs } from './app/types/HostGameArgs'
// js extension is required for ts-node/esm to work
import signals from './app/constants/strings/signals.js'
import { getWordList } from './utils/fileHandler.js'
import { getRandomArrElement, getRandomArrElements } from './utils/functions.js'

// remember to remove this
const TEST_GAME: GameListGame = {
  hostUsername: 'apparent_amethyst_walrus',
  rating: 1000,
  time: 5,
  isInProgress: true,
  hasGameStarted: false,
  currentWord: '',
  isHostsTurn: true,
  isBeingRewarded: false,
  isBeingPenalized: false,
  hostTime: 5,
  startTime: null,
  endTime: null,
  timerInterval: null,
  lastTimeUpdateTimestamp: 0,
  rematchCount: 0,
  wordHistory: [],
}

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
  // let games: GameListGame[] = []
  let games: GameListGame[] = [TEST_GAME]
  const DEFAULT_RATING = 1000
  // the fraction of the time control to reward/penalize the player for a valid/invalid word
  // e.g. a value of 3 means the player will lose 1/3 of their starting time for an invalid word
  const DEFAULT_REWARD = 6
  const DEFAULT_PENALTY = 3
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
        startTime: null,
        endTime: null,
        timerInterval: null,
        lastTimeUpdateTimestamp: 0,
        rematchCount: 0,
        wordHistory: [],
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
        game.startTime = Date.now()
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
              game.endTime = Date.now()
              game.hostTime = game.hostTime <= 0 ? 0 : game.time * 2
              io.to(game.hostUsername).emit(signals.server.timeUpdated, game.hostTime)
              if (game.hostTime <= 0) io.to(game.hostUsername).emit(signals.server.gameEnded, false)
              else io.to(game.hostUsername).emit(signals.server.gameEnded, true)
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
      let suggestedWord: string | undefined
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
          const possibleSuggestions = getPossibleWords(game.currentWord.slice(0, -1))
          suggestedWord = getRandomArrElement(possibleSuggestions)
          if (game.isHostsTurn) game.hostTime -= (game.time / DEFAULT_PENALTY) - DEFAULT_PENALTY_FREEZE_TIME
          else game.hostTime += (game.time / DEFAULT_PENALTY) - DEFAULT_PENALTY_FREEZE_TIME

          if (game.startTime) game.wordHistory.push({
            word: game.currentWord,
            time: Date.now() - game.startTime,
            player: game.isHostsTurn ? 'host' : 'challenger',
            valid: false,
            suggestions: getRandomArrElements(possibleSuggestions, 3)
          })

          // for testing where turn always changes
          // pros: maybe more intuitive when turn always changes after input
          // cons: causes the bar to jerk around (backwards b/c of the penalty, forwards on turn switch)
          // game.isHostsTurn = !game.isHostsTurn

          setTimeout(() => {
            game.currentWord = ''
            game.isBeingPenalized = false
            io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn, true)
            io.to(game.hostUsername).emit(signals.server.penaltyEnded)
          }, DEFAULT_PENALTY_FREEZE_TIME * 1000)
        }
        io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn, isValid, suggestedWord)
      }
    })

    socket.on(signals.client.inputWord, () => {
      const game = games.find(g => socket.rooms.has(g.hostUsername))
      if (game) {
        if (game.isBeingPenalized || game.isBeingRewarded || game.currentWord.length < 4) return
        const isValid = wordList.includes(game.currentWord)
        if (isValid) {
          // reward the player for a valid word
          game.isBeingRewarded = true
          if (game.isHostsTurn) game.hostTime += (game.time / DEFAULT_REWARD) + DEFAULT_REWARD_FREEZE_TIME
          else game.hostTime -= (game.time / DEFAULT_REWARD) + DEFAULT_REWARD_FREEZE_TIME

          if (game.startTime) game.wordHistory.push({
            word: game.currentWord,
            time: Date.now() - game.startTime,
            player: game.isHostsTurn ? 'host' : 'challenger',
            valid: true
          })

          game.isHostsTurn = !game.isHostsTurn

          // console.log('emitting word accepted')
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
          const possibleSuggestions = getPossibleWords(game.currentWord)
          const suggestedWord = getRandomArrElement(possibleSuggestions)
          // console.log(`game.hostTime: ${game.hostTime}`)
          if (game.isHostsTurn) game.hostTime -= (game.time / DEFAULT_PENALTY) - DEFAULT_PENALTY_FREEZE_TIME
          else game.hostTime += (game.time / DEFAULT_PENALTY) - DEFAULT_PENALTY_FREEZE_TIME
          // console.log(`game.hostTime: ${game.hostTime}`)

          if (game.startTime) game.wordHistory.push({
            word: game.currentWord,
            time: Date.now() - game.startTime,
            player: game.isHostsTurn ? 'host' : 'challenger',
            valid: false,
            suggestions: getRandomArrElements(possibleSuggestions, 3)
          })

          io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn, false, suggestedWord)
          setTimeout(() => {
            game.currentWord = ''
            game.isBeingPenalized = false
            io.to(game.hostUsername).emit(signals.server.wordUpdated, game.currentWord, game.isHostsTurn, true)
            io.to(game.hostUsername).emit(signals.server.penaltyEnded)
          }, DEFAULT_PENALTY_FREEZE_TIME * 1000)

        }
      }
    })

    socket.on(signals.client.getAnalysis, () => {
      const game = games.find(g => socket.rooms.has(g.hostUsername))
      if (game) {
        if (!game.endTime || !game.startTime) {
          console.error('missing game start or end time')
          return
        }
        io.to(game.hostUsername).emit(signals.server.analysisSent, game.wordHistory, game.endTime - game.startTime)
      }
    })

    socket.on(signals.client.requestRematch, () => {
      const roomName = Array.from(socket.rooms).find(r => r !== socket.id)
      if (!roomName) return

      const room = io.sockets.adapter.rooms.get(roomName)
      if (!room) return

      const otherSocketId = Array.from(room).find(id => id !== socket.id)
      if (!otherSocketId) return

      io.to(otherSocketId).emit(signals.server.rematchRequested)
    })

    socket.on(signals.client.acceptRematch, () => {
      const game = games.find(g => socket.rooms.has(g.hostUsername))
      if (game) {
        game.rematchCount++
        game.hasGameStarted = false
        game.currentWord = ''
        game.isHostsTurn = game.rematchCount % 2 === 0
        game.hostTime = game.time
        game.startTime = null
        game.endTime = null
        game.timerInterval = null
        game.lastTimeUpdateTimestamp = 0
        game.wordHistory = []

        io.to(game.hostUsername).emit(signals.server.gameReset, game)
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