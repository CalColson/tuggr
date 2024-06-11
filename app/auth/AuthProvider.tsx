'use client'

import { createContext, useEffect, useState, } from 'react'
import { supabase, } from '@/utils/supabase/client'
import Header from '@/components/Header/Header'
import socket from '../socket'
import { AuthUser, } from '../types/AuthUser'
import signals from '../constants/strings/signals'
import { usePathname, } from 'next/navigation'

export const AuthContext = createContext<{
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}>({
  user: null,
  setUser: () => { },
})

const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser,] = useState<AuthUser | null>(null)

  const currentRoute = usePathname()

  useEffect(() => {
    // I leverage this expression here simply to connect the socket, as AuthProvider wraps the entire app
    socket

    supabase.auth.getUser().then((res) => {
      if (res.error && res.error.name === 'AuthApiError') {
        supabase.auth.signOut()
      } else if (res.error?.name === 'AuthSessionMissingError') {
        // console.log('no session found')
      }
      else if (res.error) console.error(res.error)

      setUser(res.data.user as AuthUser | null)
    })

    const { data: authListener, } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log(event)
      // console.log(session)
      const user = (session?.user as AuthUser | null) ?? null
      setUser(user)

      if (event === 'SIGNED_IN') {
        console.log(`user ${user?.user_metadata.display_name} signed in`)
      }
      if (event === 'SIGNED_OUT') {
        console.log(`user ${user?.user_metadata.display_name} signed out`)
      }

      // socket might not be connected yet... although it probably should be... but beware race condition... refactor later
      if (session) {
        if (currentRoute.startsWith('/game/')) {
          socket.emit(signals.client.checkForActiveGame, session.user.user_metadata.display_name)
        }
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [currentRoute,])
  useEffect(() => {
    function onActiveGameFoundGlobal(hostUsername: string) {
      // this can happen either when in an active game w/ a refresh, or on another page, which means we should show an alert and redirect to the game page. this function is for the latter case.
      // TODO: handle active game found
      console.log('current route:', currentRoute)
    }
    socket.on(signals.server.activeGameFound, onActiveGameFoundGlobal)

    return () => {
      socket.off(signals.server.activeGameFound, onActiveGameFoundGlobal)
    }
  }, [currentRoute,])
  return (
    <AuthContext.Provider value={{ user, setUser, }}>
      <Header />
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
