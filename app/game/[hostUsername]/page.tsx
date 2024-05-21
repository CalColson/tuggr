'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import TugBar from '@/components/TugBar/TugBar'
import '../Game.css'
import { AuthContext } from '@/app/auth/AuthProvider'
import gameStrings from '@/app/constants/strings/gameStrings'
import { useSearchParams } from 'next/navigation'
import socket from '@/app/socket'
import signals from '@/app/constants/strings/signals'
import { time } from 'console'

function Game({ params }: { params: { hostUsername: string } }) {
  const [ellipsisAnimation, setEllipsisAnimation] = useState('...')
  const [isUnderscoreTransparent, setIsUnderscoreTransparent] = useState(false)

  const { user } = useContext(AuthContext)
  const [isHost, setIsHost] = useState(user?.user_metadata.display_name === params.hostUsername)
  const [isMyTurn, setIsMyTurn] = useState(isHost)
  const [isBeingPenalized, setIsBeingPenalized] = useState(false)
  const [currentWord, setCurrentWord] = useState('')

  const timeControl = useSearchParams().get('time')
  const [blueTime, setBlueTime] = useState(timeControl ? parseInt(timeControl) : 69)
  const hasGameStarted = useRef(false)

  useEffect(() => {
    setIsHost(user?.user_metadata.display_name === params.hostUsername)
    setIsMyTurn(isHost)
  }, [isHost, params.hostUsername, user])
  useEffect(() => {
    const currentWordElement = document.getElementById('current-word')
    if (isBeingPenalized) {
      if (currentWordElement) currentWordElement.classList.add('text-error')
    } else {
      if (currentWordElement) currentWordElement.classList.remove('text-error')
    }
  }, [isBeingPenalized])
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
      const key = event.key.toLowerCase()
      if (key.match(/[a-z]/)) {
        if (isMyTurn && !isBeingPenalized) {
          if (!hasGameStarted.current) {
            hasGameStarted.current = true
            socket.emit(signals.client.startGame)
          }
          socket.emit(signals.client.inputMove, key)
        }
      }
    }
    document.addEventListener('keypress', handleKeyPress)

    socket.on(signals.server.wordUpdated, (word: string, isHostsTurn: boolean, isValid: boolean) => {
      if (!isValid) setIsBeingPenalized(true)
      setCurrentWord(word)
      if (isHost) setIsMyTurn(isHostsTurn)
      else setIsMyTurn(!isHostsTurn)
    })
    socket.on(signals.server.penaltyEnded, () => {
      setIsBeingPenalized(false)
    })
    socket.on(signals.server.timeUpdated, (time: number) => {
      // console.log('time update: ' + time)
      setBlueTime(time)
    })

    return () => {
      clearInterval(ellipsisInterval)
      clearInterval(underscoreInterval)
      document.removeEventListener('keypress', handleKeyPress)
      socket.off(signals.server.wordUpdated)
    }
  }, [isBeingPenalized, isHost, isMyTurn, params.hostUsername])

  return (
    <div id="game" className='flex flex-col justify-center items-center h-full'>
      <h3 className="text-3xl">{isMyTurn ? gameStrings.YOUR_TURN : gameStrings.OPPONENT_TURN}</h3>
      <h3 id='current-word' className="text-3xl my-16">{currentWord}
        <span className={`${isUnderscoreTransparent ? 'text-transparent' : ''}`}>{'_'}</span>
      </h3>
      <TugBar timeControl={timeControl} blueTime={blueTime} />
      <div className='flex w-3/4 justify-between'>
        <h3 className="text-xl">{isHost ? gameStrings.YOUR_NAME : gameStrings.OPPONENT_NAME}</h3>
        <h3 className="text-xl">{isHost ? gameStrings.OPPONENT_NAME : gameStrings.YOUR_NAME}</h3>
      </div>
    </div>
  )
}

export default Game