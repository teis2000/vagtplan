'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export default function DJProfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      setEmail(session.user.email ?? null)
      supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => { if (data) setProfile(data) })
    })
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (!profile) return null

  return (
    <div style={{ padding: 24, maxWidth: 480, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ fontSize: 22, fontWeight: 500, color: '#1C1A18', marginBottom: 24 }}>Profil</div>

      {/* Avatar + name card */}
      <div style={{
        background: '#F6F4F1',
        borderRadius: 14,
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#FF6E3C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 600,
          color: 'white',
          flexShrink: 0,
        }}>
          {initials(profile.full_name)}
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#1C1A18' }}>{profile.full_name}</div>
          {email && <div style={{ fontSize: 13, color: '#9B9189', marginTop: 3 }}>{email}</div>}
          <div style={{ fontSize: 12, color: '#9B9189', marginTop: 2 }}>
            {profile.role === 'boss' ? 'Boss' : 'DJ'}
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button onClick={signOut} style={{
        width: '100%',
        padding: '14px 20px',
        background: '#F6F4F1',
        border: 'none',
        borderRadius: 14,
        fontSize: 14,
        color: '#1C1A18',
        fontFamily: 'inherit',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Log ud
      </button>
    </div>
  )
}
