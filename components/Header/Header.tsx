import React from 'react'
import './Header.css'
import HomeButton from './buttons/HomeButton'
import RightSide from './RightSide/RightSide'

import { AuthContext } from '@/app/auth/AuthProvider'

const Header = () => {
  return (
    <header id='header' className='fixed w-screen h-12'>
      <div className='flex justify-between h-full shadow-2xl px-4'>
        <div className='flex items-center gap-16'>
          <HomeButton />
          <div>about</div>
          <div>contact</div>
        </div>
        <RightSide />
      </div>
    </header>
  )
}

export default Header
