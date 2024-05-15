'use client'
import { useRouter } from 'next/navigation'
import React from 'react'

const HomeButton = () => {
  const router = useRouter()
  return (
    <button className='text-2xl' onClick={() => { router.push('/') }}>tuggr</button>
  )
}

export default HomeButton
