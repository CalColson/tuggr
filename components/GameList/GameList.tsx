'use client'

import { useEffect, useState } from 'react'
import { dummyGameListGames } from '@/utils/dummy_data'
import { isScrollbarVisible } from '@/utils/checkers'
import socket from '@/app/socket'
import Link from 'next/link'
import { GameListGame } from '@/app/types/GameListTypes'
import HostGameModal from './HostGameModal'

const GameList = () => {
  const [innerWidth, setInnerWidth] = useState(0)
  const [isScrollVisible, setIsScrollVisible] = useState(false)
  // const games = dummyGameListGames
  const games: GameListGame[] = []

  function handleJoinGame(id: string) {
    socket.emit('join-game', id)
  }
  function handleHostGame() {
    const hostGameModal = document.getElementById('host-game-modal') as HTMLDialogElement
    hostGameModal?.showModal()
  }

  // used to check if scrollbar is visible in useEffect and also when adding/subtracting new games
  const onResize = () => {
    console.log('resize occurred')
    setInnerWidth(window.innerWidth)
  }
  useEffect(() => {
    const overflowDiv = document.getElementById('game-list')

    window.addEventListener('resize', onResize)

    if (overflowDiv) {
      const isScrollVisible = isScrollbarVisible(overflowDiv)
      setIsScrollVisible(isScrollVisible)
    }

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [innerWidth])

  return (
    <>
      <HostGameModal id={'host-game-modal'} onModalClose={onResize} />
      <div id='game-list' className={'flex-1 px-8 overflow-auto' + (isScrollVisible ? '' : ' border-r')}>
        <h1 className="text-2xl text-center border-b">available games:</h1>
        <table className='min-w-full text-left'>
          <thead>
            <tr>
              <th>username</th>
              <th>rating</th>
              <th>time</th>
            </tr>
          </thead>
          <tbody>
            {games.map((user, index) => {
              return (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.rating}</td>
                  <td>{user.time}</td>
                  <td className="text-center py-2">
                    <Link href={`/game/${user.username}`}>
                      <button onClick={() => handleJoinGame(user.username)}
                        className='btn btn-success w-full'>join</button>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <button onClick={handleHostGame} className='btn btn-secondary w-full mt-4'>host a new game</button>
      </div>
    </>
  )
}

export default GameList
