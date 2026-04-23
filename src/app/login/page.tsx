'use client'

export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '0 24px',
    }}>
      {/* Logo */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 22,
        background: '#FF6E3C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="17" rx="3" stroke="white" strokeWidth="1.8"/>
          <path d="M3 9h18" stroke="white" strokeWidth="1.8"/>
          <path d="M8 2v4M16 2v4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <rect x="7" y="13" width="3" height="3" rx="1" fill="white"/>
          <rect x="11" y="13" width="3" height="3" rx="1" fill="white"/>
        </svg>
      </div>

      {/* Title */}
      <div style={{ fontSize: 28, fontWeight: 500, color: '#1C1A18', marginBottom: 6 }}>
        Vagtplan
      </div>
      <div style={{ fontSize: 14, color: '#9B9189', marginBottom: 48 }}>
        Til DJs og bookingbureauer
      </div>

      {/* Google button */}
      <button
        onClick={signIn}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '15px 20px',
          borderRadius: 14,
          background: '#FF6E3C',
          border: 'none',
          fontSize: 15,
          fontWeight: 500,
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontFamily: 'inherit',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,0.9)"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.7)"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.5)"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.8)"/>
        </svg>
        Log ind med Google
      </button>

      <div style={{
        fontSize: 11,
        color: '#9B9189',
        marginTop: 16,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 1.6,
      }}>
        Ved at logge ind accepterer du vores vilkår og betingelser.
      </div>
    </div>
  )
}
