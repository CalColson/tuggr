import React from 'react'
import './Header.css'
import RightSide from './RightSide/RightSide'

import { AuthContext } from '@/app/auth/AuthProvider'
import Link from 'next/link'

const Header = () => {
  return (
    <header id='header' className='fixed w-screen h-16'>
      <div className='flex justify-between h-full shadow-2xl px-4'>
        <div className='flex items-center gap-16'>
          <Link className='text-2xl' href='/'>tuggr</Link>
          <Link href='/'>about</Link>
          <Link href='/'>contact</Link>
        </div>
        <RightSide />
      </div>
    </header>
  )
}

export default Header
