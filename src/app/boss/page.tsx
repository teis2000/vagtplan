'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BossPage() {
  const router = useRouter()
  const [name, setName] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (!data || data.role !== 'boss') { router.replace('/login'); return }
          setName(data.full_name)
        })
    })
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 500, color: '#1C1A18' }}>Hej, {name || '...'}</div>
          <div style={{ fontSize: 13, color: '#9B9189', marginTop: 2 }}>Boss-visning</div>
        </div>
        <button onClick={signOut} style={{
          padding: '8px 16px',
          borderRadius: 10,
          border: '1px solid #E9E6E1',
          background: 'white',
          fontSize: 13,
          color: '#9B9189',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          Log ud
        </button>
      </div>

      <div style={{
        padding: 20,
        background: '#F6F4F1',
        borderRadius: 14,
        fontSize: 14,
        color: '#9B9189',
        textAlign: 'center',
      }}>
        Booking-oversigt kommer her — næste session
      </div>
    </div>
  )
}
