'use client'

import { User } from '@supabase/supabase-js'

const RightSide = ({ user }: { user: User | null }) => {
  let content: JSX.Element
  if (user) {
    content = (
      <div className='flex items-center'>
        <div>{user.id}</div>
      </div>
    )
  } else {
    content = (
      <div className='flex items-center gap-12'>
        <div>login</div>
        <div>sign up</div>
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
