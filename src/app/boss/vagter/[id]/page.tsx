'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

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
} as const

export default function EditVagtPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [djs, setDjs] = useState<DJ[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  const [djId, setDjId] = useState('')
  const [venueId, setVenueId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [djsRes, venuesRes, bookingRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name').eq('role', 'dj').order('full_name'),
        supabase.from('venues').select('id, name, price').order('name'),
        supabase.from('bookings').select('*').eq('id', id).single(),
      ])
      setDjs(djsRes.data ?? [])
      setVenues(venuesRes.data ?? [])
      if (bookingRes.data) {
        const b = bookingRes.data
        setDjId(b.dj_id ?? '')
        setVenueId(b.venue_id ?? '')
        setDate(b.date ?? '')
        setStartTime(b.start_time?.slice(0, 5) ?? '')
        setEndTime(b.end_time?.slice(0, 5) ?? '')
        setPrice(b.price != null ? String(b.price) : '')
        setNotes(b.notes ?? '')
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleVenueChange = (vid: string) => {
    setVenueId(vid)
    const venue = venues.find(v => v.id === vid)
    if (venue) setPrice(String(venue.price))
  }

  const handleSave = async () => {
    if (!djId || !venueId || !date || !startTime || !endTime) {
      setError('Udfyld alle påkrævede felter.')
      return
    }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('bookings').update({
      dj_id: djId,
      venue_id: venueId,
      date,
      start_time: startTime,
      end_time: endTime,
      price: price ? Number(price) : null,
      notes: notes || null,
    }).eq('id', id)

    if (err) {
      setError('Noget gik galt: ' + err.message)
      setSaving(false)
    } else {
      router.push('/boss')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Slet denne vagt? Dette kan ikke fortrydes.')) return
    setDeleting(true)
    await supabase.from('bookings').delete().eq('id', id)
    router.push('/boss')
  }

  if (loading) {
    return (
      <div style={{ padding: 32, color: '#9B9189', fontSize: 14 }}>Henter vagt...</div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 560 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <Link href="/boss" style={{ display: 'flex', alignItems: 'center', color: '#9B9189', textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1C1A18', margin: 0 }}>Redigér vagt</h1>
      </div>

      <div style={{
        background: 'white', borderRadius: 14, border: '1px solid #E9E6E1',
        padding: 24, display: 'flex', flexDirection: 'column', gap: 18,
      }}>

        <div>
          <label style={labelStyle}>DJ <span style={{ color: '#FF6E3C' }}>*</span></label>
          <select value={djId} onChange={e => setDjId(e.target.value)} style={inputStyle}>
            <option value="">Vælg DJ...</option>
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

        <div>
          <label style={labelStyle}>Dato <span style={{ color: '#FF6E3C' }}>*</span></label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>

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
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {error && (
          <div style={{ fontSize: 13, color: '#D94F3B', padding: '10px 12px', background: '#FFF5F3', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              padding: '10px 16px', background: 'none', color: '#D94F3B',
              border: '1px solid #E9E6E1', borderRadius: 10,
              fontSize: 14, cursor: deleting ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>
            {deleting ? 'Sletter...' : 'Slet vagt'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: saving ? '#E9E6E1' : '#FF6E3C',
              color: saving ? '#9B9189' : 'white',
              border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
            {saving ? 'Gemmer...' : 'Gem ændringer'}
          </button>
        </div>
      </div>
    </div>
  )
}
