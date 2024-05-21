'use client'

import { createContext, useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
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

  // this prevents the useEffect from running more than once in strict mode (dev env)
  const hasRun = useRef(false)

  useEffect(() => {
    // I leverage this expression here simply to connect the socket, as AuthProvider wraps the entire app
    socket

    if (!hasRun.current) {
      const supabase = createClient()
      supabase.auth.onAuthStateChange((event, session) => {
        // console.log(event)
        // console.log(session)
        if (event === 'SIGNED_IN') {
          console.log(`user ${session?.user?.id} signed in`)
          setUser(session?.user as AuthUser)
        }
        if (event === 'SIGNED_OUT') {
          console.log(`user ${session?.user?.id} signed out`)
          setUser(null)
        }
      })
      supabase.auth.getUser().then((res) => {
        if (!res.data.user) {
          const randomName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] })
          supabase.auth.signInAnonymously({
            options: {
              data: {
                display_name: randomName
              }
            }
          }).then((res) => {
            console.log(`user ${res.data.user?.id} signed in anonymously`)
          })
        }
      })
      hasRun.current = true
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
