import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  user_metadata: {
    display_name: string
  }
}