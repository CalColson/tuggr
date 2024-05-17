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
  const [games, setGames] = useState<GameListGame[]>([])

  const MODAL_ID = 'host-game-modal'

  function handleJoinGame(id: string) {
    // TODO: handle joining a game
    socket.emit('join-game', id)
  }
  function handleHostGame() {
    const hostGameModal = document.getElementById('host-game-modal') as HTMLDialogElement
    hostGameModal?.showModal()
  }

  // used to check if scrollbar is visible in useEffect and also when adding/subtracting new games
  const onResize = () => {
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
  useEffect(() => {

    function handleGameHosted(newGames: GameListGame[]) {
      setGames(newGames)
      const modal = document.getElementById(MODAL_ID) as HTMLDialogElement
      modal.close()
    }

    socket.on('games-sent', setGames)
    socket.on('game-hosted', handleGameHosted)

    socket.emit('get-games')
    return () => {
      socket.off('games-sent', setGames)
      socket.off('game-hosted', handleGameHosted)
    }
  }, [])

  return (
    <>
      <HostGameModal id={MODAL_ID} onModalClose={onResize} />
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
