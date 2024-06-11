'use client'

import { usePathname, } from 'next/navigation'
import { useEffect, useRef, } from 'react'
import socket from '../socket'
import signals from '../constants/strings/signals'

export const useNavigationEvent = (onPathnameChange: () => void) => {
  const pathname = usePathname() // Get current route

  // Save pathname on component mount into a REF
  const savedPathNameRef = useRef(pathname)

  useEffect(() => {
    // If REF has been changed, do the stuff
    if (savedPathNameRef.current !== pathname) {
      // console.log('pathname changed from: ', savedPathNameRef.current)
      // console.log('pathname changed to: ', pathname)

      if (savedPathNameRef.current.startsWith('/game/')) {
        console.log('left game')
        if (socket.connected) {
          const hostUsername = savedPathNameRef.current.split('/').pop()?.trim()
          console.log('hostUsername:', hostUsername)
          socket.emit(signals.client.leaveGame, hostUsername)
        }
      }
      onPathnameChange()
      // Update REF
      savedPathNameRef.current = pathname
    }
  }, [pathname, onPathnameChange,])
}