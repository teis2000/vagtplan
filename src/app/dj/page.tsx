'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Booking = {
  id: string
  date: string
  start_time: string
  end_time: string
  notes: string | null
  venues: { name: string } | null
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })
}

function calcDuration(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number)
  let [eh, em] = end.split(':').map(Number)
  if (eh < sh || (eh === sh && em < sm)) eh += 24
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (m === 0) return `${h} time${h !== 1 ? 'r' : ''}`
  return `${h}t ${m}m`
}

function isToday(dateStr: string) {
  const today = new Date()
  const d = new Date(dateStr)
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

function ShiftCard({ booking, variant }: { booking: Booking; variant: 'today' | 'upcoming' | 'past' }) {
  const venueName = booking.venues?.name ?? 'Ukendt spillested'
  const timeLabel = `${formatTime(booking.start_time)}–${formatTime(booking.end_time)} · ${calcDuration(booking.start_time, booking.end_time)}`

  const bg =
    variant === 'today' ? '#FF6E3C' :
    variant === 'upcoming' ? '#FFF5F2' :
    '#F9F8F7'
  const textColor =
    variant === 'today' ? 'white' :
    variant === 'past' ? '#B0A9A0' :
    '#1C1A18'
  const subColor =
    variant === 'today' ? 'rgba(255,255,255,0.75)' :
    variant === 'past' ? '#C5BEB7' :
    '#9B9189'

  return (
    <div style={{
      background: bg,
      borderRadius: 14,
      padding: '16px 18px',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 17, fontWeight: 500, color: textColor }}>{venueName}</span>
        {variant === 'today' && (
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#FF6E3C',
            background: 'white',
            borderRadius: 6,
            padding: '2px 7px',
          }}>
            I dag
          </span>
        )}
        {booking.notes && (
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: variant === 'today' ? '#FF6E3C' : 'white',
            background: variant === 'today' ? 'white' : '#FF6E3C',
            borderRadius: 6,
            padding: '2px 7px',
          }}>
            Note
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: subColor, marginBottom: 2 }}>
        {formatDate(booking.date)}
      </div>
      <div style={{ fontSize: 13, color: subColor }}>
        {timeLabel}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 500,
      color: '#9B9189',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

export default function MineVagterPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase
        .from('bookings')
        .select('id, date, start_time, end_time, notes, venues(name)')
        .eq('dj_id', session.user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      setBookings((data as Booking[]) ?? [])
      setLoading(false)
    })
  }, [])

  const nowMidnight = new Date()
  nowMidnight.setHours(0, 0, 0, 0)

  const todayBookings = bookings.filter(b => isToday(b.date))
  const upcoming = bookings.filter(b => new Date(b.date) > nowMidnight && !isToday(b.date))
  const past = bookings
    .filter(b => new Date(b.date) < nowMidnight)
    .reverse()

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 500, color: '#1C1A18', marginBottom: 24 }}>Mine vagter</div>
        <div style={{ color: '#9B9189', fontSize: 14 }}>Henter vagter...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <div style={{ fontSize: 22, fontWeight: 500, color: '#1C1A18', marginBottom: 24 }}>Mine vagter</div>

      {bookings.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#9B9189',
          fontSize: 15,
          paddingTop: 80,
        }}>
          Du har ingen vagter endnu
        </div>
      )}

      {todayBookings.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionLabel>I dag</SectionLabel>
          {todayBookings.map(b => <ShiftCard key={b.id} booking={b} variant="today" />)}
        </section>
      )}

      {upcoming.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionLabel>Kommende</SectionLabel>
          {upcoming.map(b => <ShiftCard key={b.id} booking={b} variant="upcoming" />)}
        </section>
      )}

      {past.length > 0 && (
        <section>
          <SectionLabel>Tidligere</SectionLabel>
          {past.map(b => <ShiftCard key={b.id} booking={b} variant="past" />)}
        </section>
      )}
    </div>
  )
}
