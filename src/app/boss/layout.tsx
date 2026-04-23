'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const NAV = [
  {
    href: '/boss',
    label: 'Vagter',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/boss/djs',
    label: 'DJs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M2 21c0-3.31 3.13-6 7-6s7 2.69 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/boss/steder',
    label: 'Steder',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    href: '/boss/indstillinger',
    label: 'Indstillinger',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export default function BossLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null)

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
          setProfile(data)
        })
    })
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const isActive = (href: string) =>
    href === '/boss' ? pathname === '/boss' : pathname.startsWith(href)

  if (!profile) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Desktop sidebar */}
      <aside style={{
        width: 220,
        background: '#F6F4F1',
        borderRight: '1px solid #E9E6E1',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 0 24px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }} className="sidebar-desktop">

        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#1C1A18' }}>Vagtplan</span>
          <div style={{ fontSize: 11, color: '#9B9189', marginTop: 2 }}>Boss</div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          {NAV.map(item => {
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: active ? '#FF6E3C' : 'transparent',
                color: active ? 'white' : '#5C5650',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 500 : 400,
                transition: 'background 0.15s',
              }}>
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: '16px 20px 0', borderTop: '1px solid #E9E6E1', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#FF6E3C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: 'white',
                flexShrink: 0,
              }}>
                {initials(profile.full_name)}
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#1C1A18', fontWeight: 500 }}>{profile.full_name}</div>
                <div style={{ fontSize: 11, color: '#9B9189', marginTop: 1 }}>Boss</div>
              </div>
            </div>
            <button onClick={signOut} title="Log ud" style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9B9189',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        background: '#F6F4F1',
        borderBottom: '1px solid #E9E6E1',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 10,
      }} className="topbar-mobile">
        <span style={{ fontSize: 16, fontWeight: 600, color: '#1C1A18' }}>Vagtplan</span>
        <button onClick={signOut} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          color: '#9B9189',
          fontFamily: 'inherit',
          padding: 0,
        }}>
          Log ud
        </button>
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        background: '#F9F8F7',
        marginLeft: 220,
        minHeight: '100vh',
      }} className="main-content">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: '#F6F4F1',
        borderTop: '1px solid #E9E6E1',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 10,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }} className="bottom-nav">
        {NAV.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: active ? '#FF6E3C' : '#9B9189',
              textDecoration: 'none',
              fontSize: 10,
              padding: '4px 8px',
            }}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <style>{`
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .topbar-mobile { display: flex !important; }
          .bottom-nav { display: flex !important; }
          .main-content {
            margin-left: 0 !important;
            padding-top: 52px;
            padding-bottom: 64px;
          }
        }
      `}</style>
    </div>
  )
}
