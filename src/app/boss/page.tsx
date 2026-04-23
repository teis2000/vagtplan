'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Booking = {
  id: string
  date: string
  start_time: string
  end_time: string
  notes: string | null
  price: number | null
  profiles: { full_name: string } | null
  venues: { name: string; price: number } | null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric', month: 'short' })
}

function monthLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('da-DK', { month: 'long', year: 'numeric' })
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function groupByMonth(bookings: Booking[]) {
  const groups: { label: string; items: Booking[] }[] = []
  let current: { label: string; items: Booking[] } | null = null
  for (const b of bookings) {
    const label = monthLabel(b.date)
    if (!current || current.label !== label) {
      current = { label, items: [] }
      groups.push(current)
    }
    current.items.push(b)
  }
  return groups
}

function displayPrice(b: Booking) {
  const p = b.price ?? b.venues?.price ?? null
  if (p === null) return '—'
  return p.toLocaleString('da-DK') + ' kr'
}

export default function BossPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
      supabase
        .from('bookings')
        .select(`
          id, date, start_time, end_time, notes, price,
          profiles!bookings_dj_id_fkey(full_name),
          venues(name, price)
        `)
        .order('date', { ascending: false })
        .then(({ data, error }) => {
          if (error) console.error(error)
          setBookings((data as unknown as Booking[]) ?? [])
          setLoading(false)
        })
    })
  }, [router])

  const groups = groupByMonth(bookings)

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1C1A18', margin: 0 }}>Vagter</h1>
          <div style={{ fontSize: 13, color: '#9B9189', marginTop: 3 }}>
            {loading ? '...' : `${bookings.length} vagter i alt`}
          </div>
        </div>
        <Link href="/boss/vagter/ny" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px',
          background: '#FF6E3C',
          color: 'white',
          borderRadius: 10,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 500,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Ny vagt
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ color: '#9B9189', fontSize: 14, textAlign: 'center', paddingTop: 60 }}>
          Henter vagter...
        </div>
      )}

      {/* Empty */}
      {!loading && bookings.length === 0 && (
        <div style={{
          background: '#F6F4F1',
          borderRadius: 14,
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 15, color: '#1C1A18', marginBottom: 8 }}>Ingen vagter endnu</div>
          <div style={{ fontSize: 13, color: '#9B9189' }}>Tryk på "Ny vagt" for at tilføje den første</div>
        </div>
      )}

      {/* Grouped booking list */}
      {!loading && groups.map(group => (
        <div key={group.label} style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#9B9189',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 10,
          }}>
            {group.label}
          </div>

          <div style={{
            background: 'white',
            borderRadius: 14,
            border: '1px solid #E9E6E1',
            overflow: 'hidden',
          }}>
            {group.items.map((b, i) => (
              <Link key={b.id} href={`/boss/vagter/${b.id}`} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 160px 100px 28px',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: i < group.items.length - 1 ? '1px solid #F0EDE8' : 'none',
                gap: 12,
                textDecoration: 'none',
                cursor: 'pointer',
              }} className="booking-row">

                {/* DJ + date */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1C1A18' }}>
                    {b.profiles?.full_name ?? '—'}
                  </div>
                  <div style={{ fontSize: 12, color: '#9B9189', marginTop: 2 }}>
                    {formatDate(b.date)}
                  </div>
                </div>

                {/* Venue */}
                <div style={{ fontSize: 14, color: '#5C5650' }}>
                  {b.venues?.name ?? '—'}
                </div>

                {/* Time */}
                <div style={{ fontSize: 13, color: '#9B9189' }}>
                  {formatTime(b.start_time)} – {formatTime(b.end_time)}
                </div>

                {/* Price */}
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1C1A18', textAlign: 'right' }}>
                  {displayPrice(b)}
                </div>

                {/* Edit chevron */}
                <div style={{ color: '#C5C0BA', display: 'flex', justifyContent: 'flex-end' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      <style>{`
        .booking-row:hover { background: #FAFAF9; }
      `}</style>
    </div>
  )
}
