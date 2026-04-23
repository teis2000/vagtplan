'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type DJ = { id: string; full_name: string }
type Venue = {
  id: string
  name: string
  price: number | null
  default_start_time: string | null
  default_end_time: string | null
}

const MONTHS_DA = ['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December']
const DAYS_DA = ['Ma','Ti','On','To','Fr','Lø','Sø']

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate()
}

function firstWeekday(y: number, m: number) {
  const d = new Date(y, m, 1).getDay()
  return (d + 6) % 7 // Mon=0 … Sun=6
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #E9E6E1',
  borderRadius: 10,
  fontSize: 14,
  color: '#1C1A18',
  background: 'white',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#5C5650',
  marginBottom: 6,
}

const navBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  border: '1px solid #E9E6E1',
  borderRadius: 8,
  background: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#5C5650',
  padding: 0,
}

function NyVagtInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lockedDate = searchParams.get('date') // set when coming from calendar
  const today = new Date()
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())

  const [djs, setDjs] = useState<DJ[]>([])
  const [venues, setVenues] = useState<Venue[]>([])

  // Shift template
  const [djId, setDjId] = useState('')
  const [venueId, setVenueId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')

  // Calendar
  const [viewYear, setViewYear] = useState(() => lockedDate ? parseInt(lockedDate.slice(0, 4)) : today.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => lockedDate ? parseInt(lockedDate.slice(5, 7)) - 1 : today.getMonth())
  const [selectedDates, setSelectedDates] = useState<Set<string>>(() => lockedDate ? new Set([lockedDate]) : new Set())
  const [conflictDates, setConflictDates] = useState<Set<string>>(new Set())

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
    })
    supabase.from('profiles').select('id, full_name').eq('role', 'dj').order('full_name')
      .then(({ data }) => setDjs(data ?? []))
    supabase.from('venues').select('id, name, price, default_start_time, default_end_time').order('name')
      .then(({ data }) => setVenues(data ?? []))
  }, [router])

  // Reload conflict dots when DJ or visible month changes
  useEffect(() => {
    if (!djId) { setConflictDates(new Set()); return }
    const start = toISO(viewYear, viewMonth, 1)
    const end = toISO(viewYear, viewMonth, daysInMonth(viewYear, viewMonth))
    supabase.from('bookings').select('date').eq('dj_id', djId).gte('date', start).lte('date', end)
      .then(({ data }) => setConflictDates(new Set((data ?? []).map(b => b.date))))
  }, [djId, viewYear, viewMonth])

  const handleVenueChange = (id: string) => {
    setVenueId(id)
    const venue = venues.find(v => v.id === id)
    if (venue?.price) setPrice(String(venue.price))
    if (venue?.default_start_time) setStartTime(venue.default_start_time.slice(0, 5))
    if (venue?.default_end_time) setEndTime(venue.default_end_time.slice(0, 5))
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const toggleDate = (iso: string) => {
    setSelectedDates(prev => {
      const next = new Set(prev)
      if (next.has(iso)) next.delete(iso)
      else next.add(iso)
      return next
    })
  }

  const handleSave = async () => {
    if (!venueId || !startTime || !endTime || selectedDates.size === 0) {
      setError('Vælg sted, start- og sluttid, og mindst én dato.')
      return
    }
    setSaving(true)
    setError('')

    const rows = Array.from(selectedDates).map(date => ({
      dj_id: djId || null,
      venue_id: venueId,
      date,
      start_time: startTime,
      end_time: endTime,
      price: price ? Number(price) : null,
      notes: notes || null,
    }))

    const { error: err } = await supabase.from('bookings').insert(rows)
    if (err) {
      setError('Noget gik galt: ' + err.message)
      setSaving(false)
    } else {
      router.push('/boss')
    }
  }

  // Build grid cells
  const totalDays = daysInMonth(viewYear, viewMonth)
  const offset = firstWeekday(viewYear, viewMonth)
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const n = selectedDates.size
  const conflictsInSelection = Array.from(selectedDates).filter(d => conflictDates.has(d)).length

  return (
    <div style={{ padding: '28px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/boss" style={{ display: 'flex', alignItems: 'center', color: '#9B9189', textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1C1A18', margin: 0 }}>Ny vagt</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: lockedDate ? '320px' : '260px 1fr', gap: 16, alignItems: 'start' }} className="ny-vagt-grid">

        {/* ── Left panel ── */}
        <div style={{
          background: 'white',
          borderRadius: 14,
          border: '1px solid #E9E6E1',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1A18' }}>Vagtdetaljer</div>

          <div>
            <label style={labelStyle}>DJ</label>
            <select value={djId} onChange={e => setDjId(e.target.value)} style={inputStyle}>
              <option value="">Ikke tildelt endnu</option>
              {djs.map(dj => <option key={dj.id} value={dj.id}>{dj.full_name}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Sted <span style={{ color: '#FF6E3C' }}>*</span></label>
            <select value={venueId} onChange={e => handleVenueChange(e.target.value)} style={inputStyle}>
              <option value="">Vælg sted...</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Start <span style={{ color: '#FF6E3C' }}>*</span></label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Slut <span style={{ color: '#FF6E3C' }}>*</span></label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Pris (kr)</label>
            <input
              type="number"
              placeholder="Auto-udfyldes fra sted"
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Noter</label>
            <textarea
              placeholder="Valgfri noter..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Selection status */}
          {!lockedDate && (
            <div style={{
              padding: '10px 12px',
              background: n > 0 ? '#FFF4EF' : '#F6F4F1',
              borderRadius: 8,
              fontSize: 13,
              color: n > 0 ? '#FF6E3C' : '#9B9189',
              fontWeight: n > 0 ? 500 : 400,
            }}>
              {n === 0
                ? 'Klik på datoer i kalenderen →'
                : `${n} ${n === 1 ? 'dato valgt' : 'datoer valgt'}`}
            </div>
          )}

          {!lockedDate && conflictsInSelection > 0 && (
            <div style={{
              display: 'flex',
              gap: 8,
              padding: '10px 12px',
              background: '#FFF8ED',
              border: '1px solid #FBBF50',
              borderRadius: 8,
              fontSize: 12,
              color: '#7A5C1A',
              lineHeight: 1.4,
            }}>
              <span style={{ flexShrink: 0 }}>⚠️</span>
              <span>
                {conflictsInSelection === 1
                  ? '1 valgt dato: denne DJ har allerede en vagt.'
                  : `${conflictsInSelection} valgte datoer: denne DJ har allerede vagter.`}
                {' '}Vagterne oprettes alligevel.
              </span>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 13, color: '#D94F3B', padding: '10px 12px', background: '#FFF5F3', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || n === 0}
            style={{
              padding: '12px 20px',
              background: (saving || n === 0) ? '#E9E6E1' : '#FF6E3C',
              color: (saving || n === 0) ? '#9B9189' : 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              cursor: (saving || n === 0) ? 'not-allowed' : 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              transition: 'background 0.15s',
            }}
          >
            {saving ? 'Opretter...' : n === 0 ? 'Vælg datoer' : `Opret ${n} ${n === 1 ? 'vagt' : 'vagter'}`}
          </button>
        </div>

        {/* ── Date panel: locked single date OR full multi-select calendar ── */}
        {lockedDate ? (
          <div style={{
            background: '#FFF4EF',
            borderRadius: 14,
            border: '1.5px solid #FF6E3C',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#FF6E3C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dato (låst)
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1C1A18' }}>
              {(() => {
                const d = new Date(lockedDate + 'T12:00:00')
                const weekdays = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag']
                const months = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december']
                return `${weekdays[d.getDay()]} d. ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`
              })()}
            </div>
            {conflictDates.has(lockedDate) && (
              <div style={{
                display: 'flex',
                gap: 8,
                padding: '10px 12px',
                background: '#FFF8ED',
                border: '1px solid #FBBF50',
                borderRadius: 8,
                fontSize: 12,
                color: '#7A5C1A',
                lineHeight: 1.4,
                marginTop: 4,
              }}>
                <span style={{ flexShrink: 0 }}>⚠️</span>
                <span>Denne DJ har allerede en vagt denne dag.</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: 14,
            border: '1px solid #E9E6E1',
            padding: 20,
          }}>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button onClick={prevMonth} style={navBtnStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1C1A18' }}>
                {MONTHS_DA[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} style={navBtnStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Day labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
              {DAYS_DA.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 500, color: '#9B9189', padding: '4px 0' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />
                const iso = toISO(viewYear, viewMonth, day)
                const isSelected = selectedDates.has(iso)
                const isToday = iso === todayISO
                const hasConflict = conflictDates.has(iso)
                const isPast = iso < todayISO

                return (
                  <button
                    key={iso}
                    onClick={() => toggleDate(iso)}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      background: isSelected ? '#FF6E3C' : 'transparent',
                      color: isSelected ? 'white' : isPast ? '#C8C4BE' : isToday ? '#FF6E3C' : '#1C1A18',
                      border: isToday && !isSelected ? '1.5px solid #FF6E3C' : '1.5px solid transparent',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: isSelected || isToday ? 600 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'background 0.1s',
                      padding: 0,
                    }}
                  >
                    {day}
                    {hasConflict && (
                      <span style={{
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: isSelected ? 'rgba(255,255,255,0.7)' : '#FBBF50',
                      }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9B9189' }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, background: '#FF6E3C', display: 'inline-block' }} />
                Valgt
              </div>
              {djId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9B9189' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FBBF50', display: 'inline-block' }} />
                  DJ har allerede vagt
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .ny-vagt-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function NyVagtPage() {
  return (
    <Suspense>
      <NyVagtInner />
    </Suspense>
  )
}
