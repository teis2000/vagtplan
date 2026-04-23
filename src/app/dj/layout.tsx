'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const NAV = [
  {
    href: '/dj',
    label: 'Mine vagter',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/dj/steder',
    label: 'Steder',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    href: '/dj/profil',
    label: 'Profil',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export default function DJLayout({ children }: { children: React.ReactNode }) {
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
          if (!data || (data.role !== 'dj' && data.role !== 'boss')) { router.replace('/login'); return }
          setProfile(data)
        })
    })
  }, [router])

  const isActive = (href: string) =>
    href === '/dj' ? pathname === '/dj' : pathname.startsWith(href)

  if (!profile) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Desktop sidebar */}
      <aside style={{
        width: 220,
        background: '#1A1A1A',
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
          <span style={{ fontSize: 18, fontWeight: 500, color: 'white' }}>Vagtplan</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
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
                color: active ? 'white' : '#9B9189',
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
        <div style={{ padding: '16px 20px 0', borderTop: '1px solid #2A2A2A', marginTop: 16 }}>
          {profile.role === 'boss' && (
            <Link href="/boss" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12,
              padding: '8px 10px',
              borderRadius: 8,
              background: '#2A2A2A',
              color: '#9B9189',
              textDecoration: 'none',
              fontSize: 12,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tilbage til Boss-visning
            </Link>
          )}
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
              fontWeight: 500,
              color: 'white',
              flexShrink: 0,
            }}>
              {initials(profile.full_name)}
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>{profile.full_name}</div>
              <div style={{ fontSize: 11, color: '#9B9189', marginTop: 1 }}>
                {profile.role === 'boss' ? 'Boss (DJ-visning)' : 'DJ'}
              </div>
            </div>
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
        background: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 10,
      }} className="topbar-mobile">
        <span style={{ fontSize: 16, fontWeight: 500, color: 'white' }}>Vagtplan</span>
        {profile.role === 'boss' && (
          <Link href="/boss" style={{
            fontSize: 12,
            color: '#9B9189',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Boss-visning
          </Link>
        )}
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        background: '#FFFFFF',
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
        background: '#1A1A1A',
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
