import { createBrowserClient } from '@supabase/ssr'
import { animals, colors, uniqueNamesGenerator } from 'unique-names-generator'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const generateAnonUser = () => {
  supabase.auth.getUser().then((res) => {
    if (!res.data.user) {
      const randomName = uniqueNamesGenerator({ dictionaries: [colors, animals] })
      supabase.auth.signInAnonymously({
        options: {
          data: {
            display_name: 'anon_' + randomName
          }
        }
      }).then((res) => {
        console.log(`user ${res.data.user?.id} signed in anonymously`)
      })
    }
  })
}

export { supabase, generateAnonUser }
