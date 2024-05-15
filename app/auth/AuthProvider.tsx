'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const AuthProvider = () => {
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then((res) => {
      if (!res.data.user) {
        supabase.auth.signInAnonymously().then((res) => {
          console.log(`user ${res.data.user?.id} signed in anonymously`)
        })
      } else {
        console.log(`user ${res.data.user?.id} found`)
      }
    })

  }, [])
  return (
    <>
    </>
  )
}

export default AuthProvider
