import { DEFAULT_RATING, } from '@/app/constants/defaults'
import { AuthUser, } from '@/app/types/AuthUser'
import { createBrowserClient, } from '@supabase/ssr'
import { animals, colors, uniqueNamesGenerator, } from 'unique-names-generator'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// only generates an anonymous user if the current client has no user
const generateAnonUser = async () => {
  const res = await supabase.auth.getUser()
  if (!res.data?.user) {
    const randomName = uniqueNamesGenerator({ dictionaries: [colors, animals,], })
    const signInRes = await supabase.auth.signInAnonymously({
      options: {
        data: {
          display_name: 'anon_' + randomName,
          rating: DEFAULT_RATING,
        },
      },
    })
    console.log(`user ${signInRes.data.user?.id} signed in anonymously`)
    return signInRes.data.user as AuthUser
  } else return null
}

export { supabase, generateAnonUser, }
