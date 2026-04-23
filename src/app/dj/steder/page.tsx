'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type VenueStat = {
  venue_id: string
  name: string
  count: number
  lastDate: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function DJStederPage() {
  const [venues, setVenues] = useState<VenueStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      supabase
        .from('bookings')
        .select('venue_id, date, venues(name)')
        .eq('dj_id', session.user.id)
        .order('date', { ascending: false })
        .then(({ data }) => {
          if (!data) { setLoading(false); return }

          const map = new Map<string, VenueStat>()
          for (const row of data) {
            const venue = row.venues as unknown as { name: string } | null
            if (!venue) continue
            const existing = map.get(row.venue_id)
            if (existing) {
              existing.count++
              if (row.date > existing.lastDate) existing.lastDate = row.date
            } else {
              map.set(row.venue_id, {
                venue_id: row.venue_id,
                name: venue.name,
                count: 1,
                lastDate: row.date,
              })
            }
          }

          const sorted = Array.from(map.values()).sort((a, b) => b.count - a.count)
          setVenues(sorted)
          setLoading(false)
        })
    })
  }, [])

  return (
    <div style={{ padding: 24, maxWidth: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ fontSize: 22, fontWeight: 500, color: '#1C1A18', marginBottom: 24 }}>Steder</div>

      {loading ? (
        <div style={{ color: '#9B9189', fontSize: 14 }}>Henter steder…</div>
      ) : venues.length === 0 ? (
        <div style={{
          padding: 20,
          background: '#F6F4F1',
          borderRadius: 14,
          fontSize: 14,
          color: '#9B9189',
          textAlign: 'center',
        }}>
          Du har ikke spillet nogen steder endnu
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {venues.map(v => (
            <div key={v.venue_id} style={{
              background: '#F6F4F1',
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1C1A18' }}>{v.name}</div>
                <div style={{ fontSize: 12, color: '#9B9189', marginTop: 3 }}>
                  Sidst spillet {formatDate(v.lastDate)}
                </div>
              </div>
              <div style={{
                background: '#FF6E3C',
                color: 'white',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 500,
                flexShrink: 0,
              }}>
                {v.count} {v.count === 1 ? 'gang' : 'gange'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
