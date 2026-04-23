'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

const MONTHS_DA = ['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December']
const DAYS_DA_SHORT = ['Ma','Ti','On','To','Fr','Lø','Sø']
const DAYS_DA_FULL  = ['Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag','Søndag']

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}

function firstWeekday(y: number, m: number) {
  return (new Date(y, m, 1).getDay() + 6) % 7 // Mon=0
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function effectivePrice(b: Booking) {
  const p = b.price ?? b.venues?.price ?? null
  return p !== null ? p.toLocaleString('da-DK') + ' kr' : '—'
}

function formatFullDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Stable colours per venue so the same venue is always the same shade
const CHIP_COLORS = [
  { bg: '#FFF0EB', border: '#FFD0BC', text: '#C4490A' },
  { bg: '#EBF3FF', border: '#BDD3FF', text: '#1A4FA8' },
  { bg: '#EBFBF0', border: '#BDEECE', text: '#1A7A3C' },
  { bg: '#F5EBFF', border: '#DBBCFF', text: '#6B1AA8' },
  { bg: '#FFF8EB', border: '#FFE5BC', text: '#A8620A' },
  { bg: '#FFEBF5', border: '#FFBCDF', text: '#A81A5C' },
]

function venueColor(venueId: string, venueIndex: number) {
  return CHIP_COLORS[venueIndex % CHIP_COLORS.length]
}

export default function BossPage() {
  const router = useRouter()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Build a stable venue→color-index map from the fetched data
  const venueColorMap: Record<string, number> = {}
  bookings.forEach(b => {
    const name = b.venues?.name ?? ''
    if (!(name in venueColorMap)) {
      venueColorMap[name] = Object.keys(venueColorMap).length
    }
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
    })
  }, [router])

  useEffect(() => {
    setLoading(true)
    const start = toISO(viewYear, viewMonth, 1)
    const end = toISO(viewYear, viewMonth, daysInMonth(viewYear, viewMonth))
    supabase
      .from('bookings')
      .select(`id, date, start_time, end_time, notes, price,
        profiles!bookings_dj_id_fkey(full_name),
        venues(name, price)`)
      .gte('date', start)
      .lte('date', end)
      .order('start_time')
      .then(({ data }) => {
        setBookings((data as unknown as Booking[]) ?? [])
        setLoading(false)
      })
  }, [viewYear, viewMonth])

  const prevMonth = () => {
    setSelectedDate(null)
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    setSelectedDate(null)
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const bookingsForDay = (iso: string) => bookings.filter(b => b.date === iso)

  const handleDayClick = (iso: string) => {
    setSelectedDate(prev => prev === iso ? null : iso)
  }

  // Calendar grid
  const totalDays = daysInMonth(viewYear, viewMonth)
  const offset = firstWeekday(viewYear, viewMonth)
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedBookings = selectedDate ? bookingsForDay(selectedDate) : []

  return (
    <div style={{ padding: '24px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={prevMonth} style={navBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1C1A18', margin: 0, minWidth: 180, textAlign: 'center' }}>
            {MONTHS_DA[viewMonth]} {viewYear}
          </h1>
          <button onClick={nextMonth} style={navBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(todayISO) }}
            style={{ ...navBtn, padding: '0 14px', fontSize: 12, width: 'auto' }}
          >
            I dag
          </button>
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nye vagter
        </Link>
      </div>

      {/* Calendar */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid #E9E6E1',
        overflow: 'hidden',
      }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E9E6E1' }}>
          {DAYS_DA_FULL.map((full, i) => (
            <div key={full} style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: '#9B9189',
              padding: '10px 4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              <span className="day-full">{full}</span>
              <span className="day-short">{DAYS_DA_SHORT[i]}</span>
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            const isLastRow = i >= cells.length - 7
            const borderRight = (i + 1) % 7 !== 0 ? '1px solid #F0EDE8' : 'none'
            const borderBottom = !isLastRow ? '1px solid #F0EDE8' : 'none'

            if (!day) {
              return (
                <div key={`e-${i}`} style={{
                  minHeight: 90,
                  background: '#FAFAF9',
                  borderRight,
                  borderBottom,
                }} />
              )
            }

            const iso = toISO(viewYear, viewMonth, day)
            const dayBookings = bookingsForDay(iso)
            const isToday = iso === todayISO
            const isSelected = iso === selectedDate
            const hasBookings = dayBookings.length > 0
            const MAX_VISIBLE = 3

            return (
              <div
                key={iso}
                onClick={() => handleDayClick(iso)}
                style={{
                  minHeight: 90,
                  padding: '8px 6px 6px',
                  borderRight,
                  borderBottom,
                  background: isSelected ? '#FFF4EF' : 'white',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                  position: 'relative',
                }}
                className="cal-day"
              >
                {/* Day number */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: isToday ? '#FF6E3C' : 'transparent',
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? 'white' : isSelected ? '#FF6E3C' : '#1C1A18',
                  marginBottom: 4,
                }}>
                  {day}
                </div>

                {/* Booking chips */}
                {dayBookings.slice(0, MAX_VISIBLE).map(b => {
                  const venueName = b.venues?.name ?? '—'
                  const djName = b.profiles?.full_name ?? 'Ikke tildelt'
                  const colorIdx = venueColorMap[venueName] ?? 0
                  const color = CHIP_COLORS[colorIdx % CHIP_COLORS.length]
                  return (
                    <div key={b.id} style={{
                      background: color.bg,
                      border: `1px solid ${color.border}`,
                      borderRadius: 5,
                      padding: '2px 5px',
                      marginBottom: 2,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: color.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.3,
                      }}>
                        {venueName}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: color.text,
                        opacity: 0.75,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.3,
                      }}>
                        {djName}
                      </div>
                    </div>
                  )
                })}
                {dayBookings.length > MAX_VISIBLE && (
                  <div style={{ fontSize: 10, color: '#9B9189', paddingLeft: 2 }}>
                    +{dayBookings.length - MAX_VISIBLE} mere
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDate && (
        <div style={{
          marginTop: 16,
          background: 'white',
          borderRadius: 14,
          border: '1px solid #E9E6E1',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: selectedBookings.length > 0 ? '1px solid #F0EDE8' : 'none',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1C1A18', textTransform: 'capitalize' }}>
                {formatFullDate(selectedDate)}
              </div>
              <div style={{ fontSize: 12, color: '#9B9189', marginTop: 2 }}>
                {selectedBookings.length === 0
                  ? 'Ingen vagter'
                  : `${selectedBookings.length} ${selectedBookings.length === 1 ? 'vagt' : 'vagter'}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                href={`/boss/vagter/ny`}
                style={{
                  padding: '7px 14px',
                  background: '#FF6E3C',
                  color: 'white',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                + Tilføj vagt
              </Link>
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  width: 32,
                  height: 32,
                  border: '1px solid #E9E6E1',
                  borderRadius: 8,
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9B9189',
                  padding: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {selectedBookings.map((b, i) => {
            const venueName = b.venues?.name ?? '—'
            const colorIdx = venueColorMap[venueName] ?? 0
            const color = CHIP_COLORS[colorIdx % CHIP_COLORS.length]
            return (
              <Link
                key={b.id}
                href={`/boss/vagter/${b.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '12px 1fr auto',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < selectedBookings.length - 1 ? '1px solid #F0EDE8' : 'none',
                  textDecoration: 'none',
                }}
                className="detail-row"
              >
                <div style={{ width: 12, height: 12, borderRadius: 3, background: color.bg, border: `2px solid ${color.border}`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1C1A18' }}>
                    {venueName}
                  </div>
                  <div style={{ fontSize: 12, color: '#9B9189', marginTop: 2 }}>
                    {b.profiles?.full_name ?? 'Ikke tildelt'} · {formatTime(b.start_time)}–{formatTime(b.end_time)}
                    {b.notes ? ` · ${b.notes}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1C1A18' }}>
                    {effectivePrice(b)}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="#C5C0BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <style>{`
        .cal-day:hover { background: #FAFAF9 !important; }
        .detail-row:hover { background: #FAFAF9 !important; }
        .day-short { display: none; }
        .day-full  { display: inline; }
        @media (max-width: 640px) {
          .day-short { display: inline; }
          .day-full  { display: none; }
        }
      `}</style>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  border: '1px solid #E9E6E1',
  borderRadius: 8,
  background: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#5C5650',
  padding: 0,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 12,
}
