'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import TugBar from '@/components/TugBar/TugBar'
import { AuthContext } from '@/app/auth/AuthProvider'
import gameStrings from '@/app/constants/strings/gameStrings'
import { useSearchParams } from 'next/navigation'
import socket from '@/app/socket'
import signals from '@/app/constants/strings/signals'
import { GameListGame, wordInfo } from '@/app/types/GameListTypes'
import '../Game.css'
import AnalysisModal from './AnalysisModal'

function Game({ params }: { params: { hostUsername: string } }) {
  const [ellipsisAnimation, setEllipsisAnimation] = useState('...')
  const [isUnderscoreTransparent, setIsUnderscoreTransparent] = useState(false)

  const { user } = useContext(AuthContext)
  const [isHost, setIsHost] = useState(user?.user_metadata.display_name === params.hostUsername)
  const [isMyTurn, setIsMyTurn] = useState(isHost)
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [isBeingRewarded, setIsBeingRewarded] = useState(false)
  const [isBeingPenalized, setIsBeingPenalized] = useState(false)
  const [currentWord, setCurrentWord] = useState('')
  const [suggestedWord, setSuggestedWord] = useState('')
  const [isGameEnded, setIsGameEnded] = useState(false)
  const [isWinner, setIsWinner] = useState(false)
  const [wordHistory, setWordHistory] = useState<wordInfo[]>([])
  const [matchTime, setMatchTime] = useState(0)

  const [gameEndedContent, setGameEndedContent] = useState(<></>)
  // state 0: no rematch request, state 1: rematch request sent, state 2: rematch request received
  const [rematchState, setRematchState] = useState(0)

  const timeControl = useSearchParams().get('time')
  const [blueTime, setBlueTime] = useState(timeControl ? parseInt(timeControl) : 69)
  const hasGameStarted = useRef(false)

  const MODAL_ID = 'analysis-modal'

  // set isHost and isMyTurn
  useEffect(() => {
    setIsHost(user?.user_metadata.display_name === params.hostUsername)
    setIsMyTurn(isHost)
  }, [isHost, params.hostUsername, user])

  // clean up suggested word after fading out
  useEffect(() => {
    const onAnimationEnd = (e: AnimationEvent) => {
      if (e.animationName === 'toast-fade') {
        setSuggestedWord('')
      }
    }
    const toastElement = document.querySelector('.toast') as HTMLElement
    if (toastElement) {
      toastElement.addEventListener('animationend', onAnimationEnd)

      return () => {
        toastElement.removeEventListener('animationend', onAnimationEnd)
      }
    }
  }, [])

  // handle a second word suggestion before the first one fades out
  useEffect(() => {
    if (suggestedWord) {
      const element = document.querySelector('#game .toast-fade') as HTMLElement
      if (!element) return
      element.classList.remove('toast-fade')
      // Force a reflow
      void element.offsetWidth
      element.classList.add('toast-fade')
    }
  }, [suggestedWord])

  // handle rematch state changes
  useEffect(() => {
    function handleRematchRequest() {
      setRematchState(1)
      socket.emit(signals.client.requestRematch)
    }
    function handleRematchAccept() {
      setRematchState(0)
      socket.emit(signals.client.acceptRematch)
    }
    function handleAnalysisClick() {
      socket.emit(signals.client.getAnalysis)
      const analysisModal = document.getElementById(MODAL_ID) as HTMLDialogElement
      analysisModal?.showModal()
    }

    const rematch0Content = (
      <div className='flex gap-12 my-16'>
        <button onClick={handleAnalysisClick} className='btn btn-outline btn-secondary'>{gameStrings.ANALYSIS}</button>
        <button onClick={handleRematchRequest} className='btn btn-outline btn-secondary'>{gameStrings.REMATCH_REQUEST}</button>
      </div>
    )
    const rematch1Content = (
      <span id='loading-spinner' className='loading loading-spinner loading-lg my-16 text-secondary'></span>
    )
    const rematch2Content = (
      <div className='flex gap-12 my-16'>
        <button className='btn btn-outline btn-secondary'>{gameStrings.ANALYSIS}</button>
        <button onClick={handleRematchAccept} className='btn btn-secondary'>{gameStrings.REMATCH_ACCEPT}</button>
      </div>
    )

    if (rematchState === 0) setGameEndedContent(rematch0Content)
    else if (rematchState === 1) setGameEndedContent(rematch1Content)
    else if (rematchState === 2) setGameEndedContent(rematch2Content)
  }, [rematchState])

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
      if (isBeingPenalized || isBeingRewarded || isLockedOut) return


      const key = event.key.toLowerCase()
      if (key.match(/^[a-z]$/)) {
        if (isMyTurn) {
          if (!hasGameStarted.current) {
            hasGameStarted.current = true
            socket.emit(signals.client.startGame)
          }

          setIsLockedOut(true)
          socket.emit(signals.client.inputMove, key)
        }
      }
      else if (event.key === 'Enter') {
        if (isMyTurn && currentWord.length > 3) {
          setIsLockedOut(true)
          socket.emit(signals.client.inputWord)
        }
      }
    }
    document.addEventListener('keypress', handleKeyPress)

    socket.on(signals.server.wordUpdated, (word: string,
      isHostsTurn: boolean,
      isValid: boolean,
      suggestedWord?: string | undefined
    ) => {
      if (!isValid) {
        // console.log('word invalid')
        new Audio('/sounds/buzzer.mp3').play()
        if (suggestedWord) setSuggestedWord(suggestedWord)
        setIsBeingPenalized(true)
      }

      if (word.length === currentWord.length + 1) {
        // console.log('letter added')
        new Audio('/sounds/click.mp3').play()
      }
      setCurrentWord(word)
      setIsLockedOut(false)
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
    socket.on(signals.server.analysisSent, (wordHistory: wordInfo[], matchTime: number) => {
      setWordHistory(wordHistory)
      setMatchTime(matchTime)
    })

    socket.on(signals.server.rematchRequested, () => {
      setRematchState(2)
    })

    socket.on(signals.server.gameReset, (game: GameListGame) => {
      setRematchState(0)
      setIsGameEnded(false)
      setIsWinner(false)
      setCurrentWord(game.currentWord)
      setBlueTime(game.time)
      setIsMyTurn(isHost ? game.isHostsTurn : !game.isHostsTurn)
      setWordHistory([])
      setMatchTime(0)
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
      socket.off(signals.server.analysisSent)
      socket.off(signals.server.rematchRequested)
      socket.off(signals.server.gameReset)
    }
  }, [currentWord.length, isBeingPenalized, isBeingRewarded, isHost, isLockedOut, isMyTurn, params.hostUsername])


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
  const gameOverContent = (
    <>
      <h3 className="text-3xl">{isWinner ? gameStrings.YOU_WON : gameStrings.OPPONENT_WON}</h3>
      {gameEndedContent}
    </>
  )


  return (
    <>
      <AnalysisModal id={MODAL_ID} wordHistory={wordHistory} matchTime={matchTime} />
      <div id="game" className='flex flex-col justify-center items-center h-full'>
        <div className={'toast toast-top pt-16 px-0 ' + (suggestedWord ? 'toast-fade' : 'hidden')}>
          <div className='alert alert-warning mt-2'>
            <span>{`'${suggestedWord}' was possible`}</span>
          </div>
        </div>
        <>{isGameEnded ? gameOverContent : gameContent}</>
        <TugBar timeControl={timeControl} blueTime={blueTime} isBlueTurn={(isHost && isMyTurn) || (!isHost && !isMyTurn)} />
        <div className='flex w-3/4 justify-between'>
          <h3 className="text-xl">{isHost ? gameStrings.YOUR_NAME : gameStrings.OPPONENT_NAME}</h3>
          <h3 className="text-xl">{isHost ? gameStrings.OPPONENT_NAME : gameStrings.YOUR_NAME}</h3>
        </div>
      </div>
    </>
  )
}

export default Game