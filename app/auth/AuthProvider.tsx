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

    supabase.auth.onAuthStateChange((event, session) => {
      // console.log(event)
      // console.log(session)
      if (session?.user) setUser(session.user as AuthUser)
      else setUser(null)

      if (event === 'SIGNED_IN') {
        console.log(`user ${session?.user?.id} signed in`)
      }
      if (event === 'SIGNED_OUT') {
        console.log(`user ${session?.user?.id} signed out`)
      }
    })
  }, [])
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Header />
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
