import { AuthContext, } from '@/app/auth/AuthProvider'
import { DEFAULT_TIME_CONTROL, } from '@/app/constants/defaults'
import signals from '@/app/constants/strings/signals'
import socket from '@/app/socket'
import { AuthUser, } from '@/app/types/AuthUser'
import { HostGameArgs, } from '@/app/types/HostGameArgs'
import { generateAnonUser, } from '@/utils/supabase/client'
import React, { useContext, } from 'react'

const QuickPlay = ({ setSelectedTab, }: { setSelectedTab: React.Dispatch<React.SetStateAction<string>> }) => {
  const { user, setUser, } = useContext(AuthContext)

  async function ensureUser() {
    if (!user) {
      const anonUser = await generateAnonUser()
      setUser(anonUser)
      return anonUser
    } else return user
  }
  async function handleAnyClick(timeControl: number | null = null) {
    const ensuredUser = await ensureUser()
    // TODO: try to find an existing game to join

    // TODO: if no game found, create a new game
    const hostGameArgs: HostGameArgs = {
      hostDisplayName: ensuredUser?.user_metadata.display_name as string,
      rating: ensuredUser?.user_metadata.rating as number,
      timeControl: timeControl ?? DEFAULT_TIME_CONTROL,
    }
    socket.emit(signals.client.hostGame, hostGameArgs)
    setSelectedTab('lobby')
  }

  return (
    <div className='flex flex-col justify-center gap-3 items-center h-full'>
      <h1>choose a time control:</h1>
      <button onClick={() => handleAnyClick()} className='btn btn-lg btn-secondary w-3/4'>
        <div className='flex flex-col'>
          <div>any</div>
          <div className='text-xs'>(quickest way to join a game)</div>
        </div>
      </button>
      <hr className='w-full my-3' />
      <h1>or...</h1>
      <button onClick={() => handleAnyClick(15)} className='btn btn-lg btn-secondary w-3/4'>normal (15 sec)</button>
      <button onClick={() => handleAnyClick(5)} className='btn btn-lg btn-secondary w-3/4'>fast (5 sec)</button>
      <button onClick={() => handleAnyClick(30)} className='btn btn-lg btn-secondary w-3/4'>slow (30 sec)</button>
    </div>
  )
}

export default QuickPlay
