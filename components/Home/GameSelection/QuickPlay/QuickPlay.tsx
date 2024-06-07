import { AuthContext } from '@/app/auth/AuthProvider'
import { AuthUser } from '@/app/types/AuthUser'
import { generateAnonUser } from '@/utils/supabase/client'
import React, { useContext } from 'react'

const QuickPlay = () => {
  const { user, setUser } = useContext(AuthContext)

  async function handleAnyClick() {
    if (!user) {
      const anonUser = await generateAnonUser()
      setUser(anonUser)
    }

  }

  return (
    <div className='flex flex-col justify-center gap-3 items-center h-full'>
      <h1>choose a time control:</h1>
      <button onClick={handleAnyClick} className='btn btn-lg btn-secondary w-3/4'>
        <div className='flex flex-col'>
          <div>any</div>
          <div className='text-xs'>(quickest way to join a game)</div>
        </div>
      </button>
      <hr className='w-full my-3' />
      <h1>or...</h1>
      <button className='btn btn-lg btn-secondary w-3/4'>normal (15 sec)</button>
      <button className='btn btn-lg btn-secondary w-3/4'>fast (5 sec)</button>
      <button className='btn btn-lg btn-secondary w-3/4'>slow (30 sec)</button>
    </div>
  )
}

export default QuickPlay
