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
  profiles: { full_name: string } | null
  venues: { name: string }
}

type DJ = { id: string; full_name: string }

const DAYS_DA = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']
const MONTHS_DA = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(d: Date, n: number) {
  const date = new Date(d)
  date.setDate(date.getDate() + n)
  return date
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

export default function KalenderPage() {
  const router = useRouter()
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [djs, setDjs] = useState<DJ[]>([])
  const [assigning, setAssigning] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const weekEnd = addDays(weekStart, 6)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayISO = toISO(new Date())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
    })
    supabase.from('profiles').select('id, full_name').eq('role', 'dj').order('full_name')
      .then(({ data }) => setDjs(data ?? []))
  }, [router])

  const assignDJ = async (bookingId: string, djId: string) => {
    setAssigning(prev => ({ ...prev, [bookingId]: true }))
    await supabase.from('bookings').update({ dj_id: djId }).eq('id', bookingId)
    setBookings(prev => prev.map(b =>
      b.id === bookingId
        ? { ...b, profiles: { full_name: djs.find(d => d.id === djId)?.full_name ?? '' } }
        : b
    ))
    setAssigning(prev => ({ ...prev, [bookingId]: false }))
  }

  useEffect(() => {
    setLoading(true)
    supabase
      .from('bookings')
      .select('id, date, start_time, end_time, profiles!bookings_dj_id_fkey(full_name), venues(name)')
      .gte('date', toISO(weekStart))
      .lte('date', toISO(weekEnd))
      .order('start_time')
      .then(({ data }) => {
        setBookings((data as unknown as Booking[]) ?? [])
        setLoading(false)
      })
  }, [weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  const weekLabel = (() => {
    const s = weekStart
    const e = weekEnd
    if (s.getMonth() === e.getMonth()) {
      return `${s.getDate()}–${e.getDate()} ${MONTHS_DA[s.getMonth()]} ${s.getFullYear()}`
    }
    return `${s.getDate()} ${MONTHS_DA[s.getMonth()]} – ${e.getDate()} ${MONTHS_DA[e.getMonth()]} ${e.getFullYear()}`
  })()

  const bookingsForDay = (iso: string) =>
    bookings.filter(b => b.date === iso)

  const totalThisWeek = bookings.length

  return (
    <div style={{ padding: '28px 24px', fontFamily: 'system-ui, -apple-system, sans-serif', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1C1A18', margin: 0 }}>Kalender</h1>
          <div style={{ fontSize: 13, color: '#9B9189', marginTop: 2 }}>
            {weekLabel} · {totalThisWeek} {totalThisWeek === 1 ? 'vagt' : 'vagter'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setWeekStart(getMonday(new Date()))}
            style={{
              padding: '7px 14px',
              border: '1px solid #E9E6E1',
              borderRadius: 8,
              background: 'white',
              fontSize: 13,
              color: '#5C5650',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            I dag
          </button>
          <button
            onClick={() => setWeekStart(w => addDays(w, -7))}
            style={{
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
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => setWeekStart(w => addDays(w, 7))}
            style={{
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
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <Link href="/boss/vagter/ny" style={{
            padding: '7px 16px',
            background: '#FF6E3C',
            color: 'white',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
          }}>
            + Ny vagt
          </Link>
        </div>
      </div>

      {/* Week grid — horizontally scrollable on mobile */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))',
          gap: 8,
          minWidth: 700,
        }}>
          {days.map((day, i) => {
            const iso = toISO(day)
            const isToday = iso === todayISO
            const dayBookings = bookingsForDay(iso)

            return (
              <div key={iso} style={{
                background: 'white',
                borderRadius: 12,
                border: isToday ? '1.5px solid #FF6E3C' : '1px solid #E9E6E1',
                overflow: 'hidden',
              }}>
                {/* Day header — click to add a shift on this date */}
                <Link href={`/boss/vagter/ny?date=${iso}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #F0EDE8',
                    background: isToday ? '#FFF4EF' : '#F9F8F7',
                    cursor: 'pointer',
                  }}
                    title="Opret vagt denne dag"
                  >
                    <div style={{ fontSize: 11, fontWeight: 500, color: isToday ? '#FF6E3C' : '#9B9189', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {DAYS_DA[i]}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: isToday ? '#FF6E3C' : '#1C1A18', lineHeight: 1.2 }}>
                        {day.getDate()}
                        <span style={{ fontSize: 11, fontWeight: 400, color: '#9B9189', marginLeft: 4 }}>
                          {MONTHS_DA[day.getMonth()]}
                        </span>
                      </div>
                      <span style={{ fontSize: 16, color: isToday ? '#FF6E3C' : '#C8C4BE', lineHeight: 1 }}>+</span>
                    </div>
                  </div>
                </Link>

                {/* Bookings */}
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 60 }}>
                  {loading ? (
                    <div style={{ fontSize: 11, color: '#C8C4BE', padding: '4px 0' }}>…</div>
                  ) : dayBookings.length === 0 ? (
                    <div style={{ fontSize: 11, color: '#D4D0CB', padding: '4px 0' }}>Tom</div>
                  ) : (
                    dayBookings.map(b => b.profiles ? (
                      <Link key={b.id} href={`/boss/vagter/${b.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: '#FFF4EF',
                          border: '1px solid #FFD8C6',
                          borderRadius: 8,
                          padding: '7px 9px',
                          cursor: 'pointer',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#1C1A18', marginBottom: 2 }}>
                            {b.profiles.full_name}
                          </div>
                          <div style={{ fontSize: 11, color: '#7A6A5F' }}>{b.venues.name}</div>
                          <div style={{ fontSize: 11, color: '#9B9189', marginTop: 2 }}>
                            {formatTime(b.start_time)}–{formatTime(b.end_time)}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div key={b.id} style={{
                        background: '#F6F4F1',
                        border: '1px dashed #C8C4BE',
                        borderRadius: 8,
                        padding: '7px 9px',
                      }}>
                        <div style={{ fontSize: 11, color: '#9B9189', marginBottom: 2 }}>Ingen DJ</div>
                        <div style={{ fontSize: 11, color: '#7A6A5F' }}>{b.venues.name}</div>
                        <div style={{ fontSize: 11, color: '#9B9189', marginTop: 2 }}>
                          {formatTime(b.start_time)}–{formatTime(b.end_time)}
                        </div>
                        <select
                          value=""
                          onChange={e => { if (e.target.value) assignDJ(b.id, e.target.value) }}
                          disabled={assigning[b.id]}
                          style={{
                            marginTop: 6,
                            width: '100%',
                            padding: '4px 6px',
                            border: '1px solid #E9E6E1',
                            borderRadius: 6,
                            fontSize: 11,
                            color: '#5C5650',
                            background: 'white',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          <option value="">{assigning[b.id] ? 'Tildeler...' : 'Tildel DJ...'}</option>
                          {djs.map(dj => <option key={dj.id} value={dj.id}>{dj.full_name}</option>)}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
