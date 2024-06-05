import React from 'react'
import './Header.css'
import RightSide from './RightSide/RightSide'

import { AuthContext } from '@/app/auth/AuthProvider'
import Link from 'next/link'
import RulesModal from '../RulesModal'

const Header = () => {
  const RULES_MODAL_ID = 'rules-modal'
  function onRulesClick() {
    const modal = document.getElementById(RULES_MODAL_ID) as HTMLDialogElement
    const modalContent = modal.querySelector('.modal-box') as HTMLElement
    modal.showModal()
    modalContent.scrollTop = 0
  }

  return (
    <>
      <RulesModal id={RULES_MODAL_ID} />
      <header id='header' className='fixed w-screen h-16'>
        <div className='flex justify-between h-full shadow-2xl px-4'>
          <div className='flex items-center gap-16'>
            <Link className='text-2xl' href='/'>tuggr</Link>
            <button onClick={onRulesClick}>rules</button>
            <Link href='/about'>about</Link>
            <Link href='/contact'>contact</Link>
          </div>
          <RightSide />
        </div>
      </header>
    </>
  )
}

export default Header
