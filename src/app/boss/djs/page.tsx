'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type DJ = { id: string; full_name: string; created_at?: string }

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export default function BossDjsPage() {
  const [djs, setDjs] = useState<DJ[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadDjs() }, [])

  async function loadDjs() {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'dj')
      .order('full_name')
    setDjs(data ?? [])
    setLoading(false)
  }

  async function removeDj(id: string, name: string) {
    if (!confirm(`Fjern "${name}" som DJ? De mister adgang til appen. Vagter de allerede har forbliver i systemet.`)) return
    setRemovingId(id)
    await supabase.from('profiles').delete().eq('id', id)
    setRemovingId(null)
    await loadDjs()
  }

  function copyInviteLink() {
    const url = window.location.origin + '/login'
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1C1A18', margin: 0 }}>DJs</h1>
          <div style={{ fontSize: 13, color: '#9B9189', marginTop: 3 }}>
            {loading ? '...' : `${djs.length} registrerede DJs`}
          </div>
        </div>
        <button onClick={copyInviteLink} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 18px',
          background: copied ? '#E8F5E9' : '#F6F4F1',
          color: copied ? '#2E7D32' : '#5C5650',
          borderRadius: 10, border: '1px solid #E9E6E1',
          fontSize: 14, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.2s',
        }}>
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Kopieret!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Kopiér invitationslink
            </>
          )}
        </button>
      </div>

      {/* How DJs join */}
      <div style={{
        background: '#FFF8F5', border: '1px solid #FFE0D1',
        borderRadius: 10, padding: '12px 16px', marginBottom: 28,
        fontSize: 13, color: '#7A4030',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span>
          DJs får adgang ved at logge ind på appen med Google — de vises automatisk her bagefter.
          Del invitationslinket ovenfor med dine DJs.
        </span>
      </div>

      {loading && (
        <div style={{ color: '#9B9189', fontSize: 14, textAlign: 'center', paddingTop: 60 }}>
          Henter DJs...
        </div>
      )}

      {!loading && djs.length === 0 && (
        <div style={{ background: '#F6F4F1', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, color: '#1C1A18', marginBottom: 8 }}>Ingen DJs endnu</div>
          <div style={{ fontSize: 13, color: '#9B9189' }}>
            Del invitationslinket med dine DJs — de logger ind med Google og dukker op her
          </div>
        </div>
      )}

      {!loading && djs.length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E9E6E1', overflow: 'hidden' }}>
          {djs.map((dj, i) => (
            <div key={dj.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: i < djs.length - 1 ? '1px solid #F0EDE8' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#FF6E3C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0,
                }}>
                  {initials(dj.full_name)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1C1A18' }}>{dj.full_name}</div>
              </div>
              <button
                onClick={() => removeDj(dj.id, dj.full_name)}
                disabled={removingId === dj.id}
                style={{
                  padding: '6px 12px', background: 'none', color: '#D94F3B',
                  border: '1px solid #E9E6E1', borderRadius: 8, fontSize: 12,
                  cursor: removingId === dj.id ? 'default' : 'pointer', fontFamily: 'inherit',
                }}>
                {removingId === dj.id ? '...' : 'Fjern'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
