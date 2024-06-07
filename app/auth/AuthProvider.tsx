'use client'

import { createContext, useEffect, useRef, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import Header from '@/components/Header/Header'
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'
import socket from '../socket'
import { AuthUser } from '../types/AuthUser'

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
  const [user, setUser] = useState<AuthUser | null>(null)

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

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Header />
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
