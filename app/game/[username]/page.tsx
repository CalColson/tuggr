'use client'

import { useEffect, useState } from 'react'
import TugBar from '@/components/TugBar/TugBar'
import socket from '@/app/socket'

import '../Game.css'

function Game({ params }: { params: { username: string } }) {
  const [isConnected, setIsConnected] = useState(false)
  const [opponentConnected, setOpponentConnected] = useState(false)
  const [ellipsisAnimation, setEllipsisAnimation] = useState('...')
  const [underscoreAnimation, setUnderscoreAnimation] = useState('_')


  const WAITING_STRING = 'Waiting for connection'

  useEffect(() => {
    socket

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

    return () => {
      clearInterval(ellipsisInterval)
      clearInterval(underscoreInterval)
    }
  }, [])

  return (
    <div id="game" className='flex flex-col justify-center items-center h-full'>
      <h3 className="text-3xl mb-16">{!opponentConnected ? WAITING_STRING + ellipsisAnimation : underscoreAnimation}</h3>
      <TugBar />
    </div>
  )
}

export default Game