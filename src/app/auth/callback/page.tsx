'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // With implicit flow, Supabase automatically parses the session
    // from the URL hash. We just listen for the sign-in event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/')
      }
    })

    // Also check if session already exists (in case event already fired)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/')
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#9B9189',
      fontSize: 14,
    }}>
      Logger ind...
    </div>
  )
}
