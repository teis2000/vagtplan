'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type DJ = { id: string; full_name: string }
type Venue = { id: string; name: string; price: number }

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #E9E6E1',
  borderRadius: 10,
  fontSize: 14,
  color: '#1C1A18',
  background: 'white',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#5C5650',
  marginBottom: 6,
}

export default function NyVagtPage() {
  const router = useRouter()
  const [djs, setDjs] = useState<DJ[]>([])
  const [venues, setVenues] = useState<Venue[]>([])

  const [djId, setDjId] = useState('')
  const [venueId, setVenueId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/login'); return }
    })

    supabase.from('profiles').select('id, full_name').eq('role', 'dj').order('full_name')
      .then(({ data }) => setDjs(data ?? []))

    supabase.from('venues').select('id, name, price').order('name')
      .then(({ data }) => setVenues(data ?? []))
  }, [router])

  const handleVenueChange = (id: string) => {
    setVenueId(id)
    const venue = venues.find(v => v.id === id)
    if (venue) setPrice(String(venue.price))
  }

  const handleSave = async () => {
    if (!djId || !venueId || !date || !startTime || !endTime) {
      setError('Udfyld alle påkrævede felter.')
      return
    }
    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('bookings').insert({
      dj_id: djId,
      venue_id: venueId,
      date,
      start_time: startTime,
      end_time: endTime,
      price: price ? Number(price) : null,
      notes: notes || null,
    })

    if (err) {
      setError('Noget gik galt: ' + err.message)
      setSaving(false)
    } else {
      router.push('/boss')
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 560 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <Link href="/boss" style={{
          display: 'flex',
          alignItems: 'center',
          color: '#9B9189',
          textDecoration: 'none',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1C1A18', margin: 0 }}>Ny vagt</h1>
      </div>

      <div style={{
        background: 'white',
        borderRadius: 14,
        border: '1px solid #E9E6E1',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}>

        {/* DJ */}
        <div>
          <label style={labelStyle}>DJ <span style={{ color: '#FF6E3C' }}>*</span></label>
          <select value={djId} onChange={e => setDjId(e.target.value)} style={inputStyle}>
            <option value="">Vælg DJ...</option>
            {djs.map(dj => (
              <option key={dj.id} value={dj.id}>{dj.full_name}</option>
            ))}
          </select>
        </div>

        {/* Venue */}
        <div>
          <label style={labelStyle}>Sted <span style={{ color: '#FF6E3C' }}>*</span></label>
          <select value={venueId} onChange={e => handleVenueChange(e.target.value)} style={inputStyle}>
            <option value="">Vælg sted...</option>
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label style={labelStyle}>Dato <span style={{ color: '#FF6E3C' }}>*</span></label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>

        {/* Times */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Start <span style={{ color: '#FF6E3C' }}>*</span></label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Slut <span style={{ color: '#FF6E3C' }}>*</span></label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Price */}
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

        {/* Notes */}
        <div>
          <label style={labelStyle}>Noter</label>
          <textarea
            placeholder="Valgfri noter..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ fontSize: 13, color: '#D94F3B', padding: '10px 12px', background: '#FFF5F3', borderRadius: 8 }}>
            {error}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 20px',
            background: saving ? '#E9E6E1' : '#FF6E3C',
            color: saving ? '#9B9189' : 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {saving ? 'Gemmer...' : 'Gem vagt'}
        </button>
      </div>
    </div>
  )
}
