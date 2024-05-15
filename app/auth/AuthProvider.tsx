'use client'

import { createContext, useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Header from '@/components/Header/Header'
import { User } from '@supabase/supabase-js'

export const AuthContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => { },
})

const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null)

  // this prevents the useEffect from running more than once in strict mode (dev env)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!hasRun.current) {
      const supabase = createClient()
      supabase.auth.getUser().then((res) => {
        if (!res.data.user) {
          supabase.auth.signInAnonymously().then((res) => {
            console.log(`user ${res.data.user?.id} signed in anonymously`)
            setUser(res.data.user)
          })
        } else {
          console.log(`user ${res.data.user?.id} found`)
          setUser(res.data.user)
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
