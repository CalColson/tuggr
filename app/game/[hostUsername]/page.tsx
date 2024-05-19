'use client'

import { useContext, useEffect, useState } from 'react'
import TugBar from '@/components/TugBar/TugBar'
import '../Game.css'
import { AuthContext } from '@/app/auth/AuthProvider'
import gameStrings from '@/app/constants/strings/gameStrings'
import { useSearchParams } from 'next/navigation'
import socket from '@/app/socket'
import signals from '@/app/constants/strings/signals'

function Game({ params }: { params: { hostUsername: string } }) {
  const [ellipsisAnimation, setEllipsisAnimation] = useState('...')
  const [underscoreAnimation, setUnderscoreAnimation] = useState('_')

  const { user } = useContext(AuthContext)
  const [isHost, setIsHost] = useState(user?.user_metadata.display_name === params.hostUsername)
  const [isMyTurn, setIsMyTurn] = useState(isHost)
  const timeControl = useSearchParams().get('time')

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
      setUnderscoreAnimation((prev) => {
        // below code is a non-breaking space to maintain the height of the text
        return prev === '_' ? '\u00A0' : '_'
      })
    }, 500)

    if (socket.connected) {
      console.log('emitting ensure')
      socket.emit(signals.client.ensureGameJoined, params.hostUsername)
    }

    return () => {
      clearInterval(ellipsisInterval)
      clearInterval(underscoreInterval)
    }
  }, [params.hostUsername])

  return (
    <div id="game" className='flex flex-col justify-center items-center h-full'>
      <h3 className="text-3xl">{isMyTurn ? gameStrings.YOUR_TURN : gameStrings.OPPONENT_TURN}</h3>
      <h3 className="text-3xl my-16">{underscoreAnimation}</h3>
      <TugBar timeControl={timeControl} />
      <div className='flex w-3/4 justify-between'>
        <h3 className="text-xl">{isHost ? gameStrings.YOUR_NAME : gameStrings.OPPONENT_NAME}</h3>
        <h3 className="text-xl">{isHost ? gameStrings.OPPONENT_NAME : gameStrings.YOUR_NAME}</h3>
      </div>
    </div>
  )
}

export default Game