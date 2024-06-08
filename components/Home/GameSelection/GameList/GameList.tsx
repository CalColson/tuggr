'use client'

import { useContext, useEffect, useState } from 'react'
import { isScrollbarVisible } from '@/utils/functions'
import socket from '@/app/socket'
import { GameListGame } from '@/app/types/GameListTypes'
import HostGameModal from './HostGameModal'
import { AuthContext } from '@/app/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import signals from '@/app/constants/strings/signals'
import { supabase } from '@/utils/supabase/client'

const GameList = () => {
  const [innerWidth, setInnerWidth] = useState(0)
  const [isScrollVisible, setIsScrollVisible] = useState(false)
  const { user } = useContext(AuthContext)
  const router = useRouter()

  const [games, setGames] = useState<GameListGame[]>([])

  const MODAL_ID = 'host-game-modal'

  function handleJoinGame(hostUsername: string) {
    socket.emit(signals.client.joinGame, hostUsername)

  }
  function handleHostGame() {
    const hostGameModal = document.getElementById(MODAL_ID) as HTMLDialogElement
    hostGameModal?.showModal()
  }
  function handleDeleteHostedGame() {
    socket.emit(signals.client.deleteHostedGame, user?.user_metadata.display_name)
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
    // initial fetch of games
    supabase.from('game_list_games').select<'*', GameListGame>('*').then(({ data, error }) => {
      if (error) {
        console.error(error)
      }
      else {
        if (data) setGames(data)
      }
    })


    const channel = supabase
      .channel('game_list_games')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_list_games' }, (payload) => {
        console.log(payload)
      })
      .subscribe()


    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  useEffect(() => {

    function handleGameHosted(newGames: GameListGame[]) {
      setGames(newGames)
      const modal = document.getElementById(MODAL_ID) as HTMLDialogElement
      modal.close()
    }
    function handleGameJoined(game: GameListGame) {
      console.log('joined game: ' + game.hostUsername)
      router.push(`/game/${game.hostUsername}?time=${game.time}`)

    }

    socket.on(signals.server.gamesSent, setGames)
    socket.on(signals.server.gameHosted, handleGameHosted)
    socket.on(signals.server.gameJoined, handleGameJoined)

    socket.emit(signals.client.getGames)
    return () => {
      socket.off(signals.server.gamesSent, setGames)
      socket.off(signals.server.gameHosted, handleGameHosted)
      socket.off(signals.server.gameJoined, handleGameJoined)
    }
  }, [router])

  return (
    <>
      <HostGameModal id={MODAL_ID} onModalClose={onResize} />
      <div id='game-list' className={'px-8 overflow-auto'}>
        <table className='min-w-full text-left'>
          <thead>
            <tr>
              <th>username</th>
              <th>rating</th>
              <th>time</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => {
              return (
                <tr key={index}>
                  <td>{game.hostUsername}</td>
                  <td>{game.rating}</td>
                  <td>{game.time}</td>
                  <td className="text-center max-w-14 py-2">
                    {game.hostUsername == user?.user_metadata.display_name ? (
                      <button onClick={handleDeleteHostedGame}
                        className='btn btn-error w-full'>cancel</button>
                    ) : (
                      <button onClick={() => handleJoinGame(game.hostUsername)}
                        className='btn btn-success w-full'>join</button>
                    )}
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
