'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
        return
      }
      supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .then(async ({ data }) => {
          if (!data) {
            // First login — create profile
            await supabase.from('profiles').insert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name
                || session.user.user_metadata?.name
                || session.user.email?.split('@')[0]
                || 'Ukendt',
              email: session.user.email || '',
              role: 'dj',
            })
          }
          const role = data?.role ?? 'dj'
          if (role === 'boss') router.replace('/boss')
          else router.replace('/dj')
        })
    })
  }, [router])

  return null
}
