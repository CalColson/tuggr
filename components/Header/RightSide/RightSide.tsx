'use client'

import { AuthContext } from '@/app/auth/AuthProvider'
import { createClient } from '@/utils/supabase/client'
import Avatar from 'boring-avatars'
import Link from 'next/link'
import { useContext } from 'react'

const RightSide = () => {
  const { user, setUser } = useContext(AuthContext)

  const handleSignOut = () => {
    createClient().auth.signOut().then(() => {
      setUser(null)
    })
  }

  let content: JSX.Element
  if (user) {
    content = (
      <div className='flex items-center gap-3'>
        <button onClick={handleSignOut}>
          <Avatar
            name={user.user_metadata.display_name}
            variant='beam'
            colors={['#0a0310', '#49007e', '#ff005b', '#ff7d10', '#ffb238']} />
        </button>
        <button onClick={handleSignOut}>{user.user_metadata.display_name}</button>
      </div>
    )
  } else {
    content = (
      <div className='flex items-center gap-12'>
        <Link href='/'>login</Link>
        <Link href='/'>sign up</Link>
      </div>
    )
  }

  return (
    <>
      {content}
    </>
  )
}

export default RightSide
