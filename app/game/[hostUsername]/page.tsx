'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import TugBar from '@/components/TugBar/TugBar'
import '../Game.css'
import { AuthContext } from '@/app/auth/AuthProvider'
import gameStrings from '@/app/constants/strings/gameStrings'
import { useSearchParams } from 'next/navigation'
import socket from '@/app/socket'
import signals from '@/app/constants/strings/signals'
import { GameListGame } from '@/app/types/GameListTypes'

function Game({ params }: { params: { hostUsername: string } }) {
  const [ellipsisAnimation, setEllipsisAnimation] = useState('...')
  const [isUnderscoreTransparent, setIsUnderscoreTransparent] = useState(false)

  const { user } = useContext(AuthContext)
  const [isHost, setIsHost] = useState(user?.user_metadata.display_name === params.hostUsername)
  const [isMyTurn, setIsMyTurn] = useState(isHost)
  const [isBeingPenalized, setIsBeingPenalized] = useState(false)
  const [isBeingRewarded, setIsBeingRewarded] = useState(false)
  const [currentWord, setCurrentWord] = useState('')
  const [isGameEnded, setIsGameEnded] = useState(false)
  const [isWinner, setIsWinner] = useState(false)

  // state 0: no rematch request, state 1: rematch request sent, state 2: rematch request received
  const [rematchState, setRematchState] = useState(0)

  const timeControl = useSearchParams().get('time')
  const [blueTime, setBlueTime] = useState(timeControl ? parseInt(timeControl) : 69)
  const hasGameStarted = useRef(false)

  useEffect(() => {
    setIsHost(user?.user_metadata.display_name === params.hostUsername)
    setIsMyTurn(isHost)
  }, [isHost, params.hostUsername, user])
  useEffect(() => {
    // setup ellipsis animation
    const ellipsisInterval = setInterval(() => {
      setEllipsisAnimation((prev) => {
        return prev === '...' ? '' : prev + '.'
      })
    }, 500)
    // setup underscore animation
    const underscoreInterval = setInterval(() => {
      setIsUnderscoreTransparent((prev) => {
        return !prev
      })
    }, 500)

    const handleKeyPress = (event: KeyboardEvent) => {
      if (isBeingPenalized || isBeingRewarded) return


      const key = event.key.toLowerCase()
      if (key.match(/^[a-z]$/)) {
        if (isMyTurn) {
          if (!hasGameStarted.current) {
            hasGameStarted.current = true
            socket.emit(signals.client.startGame)
          }
          socket.emit(signals.client.inputMove, key)
        }
      }
      else if (event.key === 'Enter') {
        if (isMyTurn && currentWord.length > 3) {
          socket.emit(signals.client.inputWord)
        }
      }
    }
    document.addEventListener('keypress', handleKeyPress)

    socket.on(signals.server.wordUpdated, (word: string, isHostsTurn: boolean, isValid: boolean) => {
      if (!isValid) {
        // console.log('word invalid')
        new Audio('/sounds/buzzer.mp3').play()
        setIsBeingPenalized(true)
      }

      if (word.length === currentWord.length + 1) {
        // console.log('letter added')
        new Audio('/sounds/click.mp3').play()
      }
      setCurrentWord(word)
      if (isHost) setIsMyTurn(isHostsTurn)
      else setIsMyTurn(!isHostsTurn)
    })
    socket.on(signals.server.wordAccepted, () => {
      // console.log('word accepted')
      new Audio('/sounds/ding.mp3').play()
      setIsBeingRewarded(true)
    })
    socket.on(signals.server.rewardEnded, () => {
      setIsBeingRewarded(false)
      setCurrentWord('')
    })
    socket.on(signals.server.penaltyEnded, () => {
      setIsBeingPenalized(false)
    })
    socket.on(signals.server.timeUpdated, (time: number) => {
      // console.log('time update: ' + time)
      setBlueTime(time)
    })
    socket.on(signals.server.gameEnded, (hostWon: boolean) => {
      if ((hostWon && isHost) || (!hostWon && !isHost)) setIsWinner(true)
      // console.log(`hostWon: ${hostWon}, isHost: ${isHost}`)
      setIsGameEnded(true)
    })

    socket.on(signals.server.rematchRequested, () => {
      const rematchRequestButton = document.getElementById('rematch-request-button')
      if (rematchRequestButton) rematchRequestButton.classList.add('hidden')
      const loadingSpinner = document.getElementById('loading-spinner')
      if (loadingSpinner) loadingSpinner.classList.add('hidden')
      const rematchAcceptButton = document.getElementById('rematch-accept-button')
      if (rematchAcceptButton) rematchAcceptButton.classList.remove('hidden')
    })

    socket.on(signals.server.gameReset, (game: GameListGame) => {
      setRematchState(0)
      setIsGameEnded(false)
      setIsWinner(false)
      setCurrentWord(game.currentWord)
      setBlueTime(game.time)
      setIsMyTurn(isHost ? game.isHostsTurn : !game.isHostsTurn)
      hasGameStarted.current = false
    })

    return () => {
      clearInterval(ellipsisInterval)
      clearInterval(underscoreInterval)
      document.removeEventListener('keypress', handleKeyPress)
      socket.off(signals.server.wordUpdated)
      socket.off(signals.server.wordAccepted)
      socket.off(signals.server.rewardEnded)
      socket.off(signals.server.penaltyEnded)
      socket.off(signals.server.timeUpdated)
      socket.off(signals.server.gameEnded)
      socket.off(signals.server.rematchRequested)
      socket.off(signals.server.gameReset)
    }
  }, [currentWord.length, isBeingPenalized, isBeingRewarded, isHost, isMyTurn, params.hostUsername])


  const gameContent = (
    <>
      <h3 className="text-3xl">{isMyTurn ? gameStrings.YOUR_TURN : gameStrings.OPPONENT_TURN}</h3>
      <h3 id='current-word'
        className={'text-3xl my-16 ' + (isBeingRewarded ? 'text-success' : '') +
          (isBeingPenalized ? 'text-error' : '')}>{currentWord}
        <span className={`${isUnderscoreTransparent ? 'text-transparent' : ''}`}>{'_'}</span>
      </h3>
    </>
  )

  function handleRematchRequest() {
    setRematchState(1)
    socket.emit(signals.client.requestRematch)

    const rematchRequestButton = document.getElementById('rematch-request-button')
    if (rematchRequestButton) rematchRequestButton.classList.add('hidden')
    const loadingSpinner = document.getElementById('loading-spinner')
    if (loadingSpinner) loadingSpinner.classList.remove('hidden')
  }
  function handleRematchAccept() {
    setRematchState(0)

    socket.emit(signals.client.acceptRematch)
  }
  const rematch0Content = (
    <button id='rematch-request-button'
      onClick={handleRematchRequest}
      className='btn btn-outline btn-secondary my-16'>
      {gameStrings.REMATCH_REQUEST}
    </button>
  )
  const rematch1Content = (
    <span id='loading-spinner' className='loading loading-spinner loading-lg my-16 text-secondary hidden'></span>
  )
  const rematch2Content = (
    <button id='rematch-accept-button'
      onClick={handleRematchAccept}
      className='btn btn-secondary my-16 hidden'>
      {gameStrings.REMATCH_ACCEPT}
    </button>
  )
  const gameOverContent = (
    <>
      <h3 className="text-3xl">{isWinner ? gameStrings.YOU_WON : gameStrings.OPPONENT_WON}</h3>
      {rematch0Content}
      {rematch1Content}
      {rematch2Content}
    </>
  )


  return (
    <div id="game" className='flex flex-col justify-center items-center h-full'>
      <>{isGameEnded ? gameOverContent : gameContent}</>
      <TugBar timeControl={timeControl} blueTime={blueTime} />
      <div className='flex w-3/4 justify-between'>
        <h3 className="text-xl">{isHost ? gameStrings.YOUR_NAME : gameStrings.OPPONENT_NAME}</h3>
        <h3 className="text-xl">{isHost ? gameStrings.OPPONENT_NAME : gameStrings.YOUR_NAME}</h3>
      </div>
    </div>
  )
}

export default Game