'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Venue = { id: string; name: string; price: number | null }

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #E9E6E1',
  borderRadius: 8,
  fontSize: 14,
  color: '#1C1A18',
  background: 'white',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

export default function BossStederPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { loadVenues() }, [])

  async function loadVenues() {
    const { data } = await supabase.from('venues').select('id, name, price').order('name')
    setVenues(data ?? [])
    setLoading(false)
  }

  async function addVenue() {
    if (!newName.trim()) return
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('venues').insert({
      name: newName.trim(),
      price: newPrice ? parseFloat(newPrice) : null,
    })
    if (err) {
      setError(err.message)
    } else {
      setNewName('')
      setNewPrice('')
      setShowAdd(false)
      await loadVenues()
    }
    setSaving(false)
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return
    setSaving(true)
    await supabase.from('venues').update({
      name: editName.trim(),
      price: editPrice ? parseFloat(editPrice) : null,
    }).eq('id', id)
    setEditId(null)
    setSaving(false)
    await loadVenues()
  }

  async function deleteVenue(id: string, name: string) {
    if (!confirm(`Slet "${name}"? Dette kan ikke fortrydes, og vagter der bruger dette sted mister stedets navn.`)) return
    setDeletingId(id)
    await supabase.from('venues').delete().eq('id', id)
    setDeletingId(null)
    await loadVenues()
  }

  function startEdit(v: Venue) {
    setEditId(v.id)
    setEditName(v.name)
    setEditPrice(v.price?.toString() ?? '')
  }

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1C1A18', margin: 0 }}>Spillesteder</h1>
          <div style={{ fontSize: 13, color: '#9B9189', marginTop: 3 }}>
            {loading ? '...' : `${venues.length} steder`}
          </div>
        </div>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px',
            background: '#FF6E3C', color: 'white',
            borderRadius: 10, border: 'none',
            fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nyt sted
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{
          background: 'white', borderRadius: 14,
          border: '1px solid #E9E6E1', padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1A18', marginBottom: 16 }}>Nyt spillested</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#9B9189', display: 'block', marginBottom: 6 }}>
                Navn <span style={{ color: '#FF6E3C' }}>*</span>
              </label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addVenue()}
                placeholder="f.eks. Rust, Vega, Atlas..."
                autoFocus
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9B9189', display: 'block', marginBottom: 6 }}>Standardpris (kr)</label>
              <input
                type="number"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addVenue()}
                placeholder="0"
                style={inputStyle}
              />
            </div>
          </div>
          {error && (
            <div style={{ fontSize: 13, color: '#D94F3B', marginBottom: 12 }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addVenue} disabled={saving || !newName.trim()} style={{
              padding: '9px 18px',
              background: saving || !newName.trim() ? '#E9E6E1' : '#FF6E3C',
              color: saving || !newName.trim() ? '#9B9189' : 'white',
              borderRadius: 8, border: 'none',
              fontSize: 14, fontWeight: 500,
              cursor: saving || !newName.trim() ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}>
              {saving ? 'Gemmer...' : 'Gem sted'}
            </button>
            <button onClick={() => { setShowAdd(false); setNewName(''); setNewPrice(''); setError('') }} style={{
              padding: '9px 18px', background: 'none', color: '#9B9189',
              borderRadius: 8, border: '1px solid #E9E6E1',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Annuller
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ color: '#9B9189', fontSize: 14, textAlign: 'center', paddingTop: 60 }}>
          Henter steder...
        </div>
      )}

      {!loading && venues.length === 0 && !showAdd && (
        <div style={{ background: '#F6F4F1', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, color: '#1C1A18', marginBottom: 8 }}>Ingen spillesteder endnu</div>
          <div style={{ fontSize: 13, color: '#9B9189' }}>Tilføj et sted for at kunne oprette vagter</div>
        </div>
      )}

      {!loading && venues.length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E9E6E1', overflow: 'hidden' }}>
          {venues.map((v, i) => (
            <div key={v.id} style={{
              padding: '14px 18px',
              borderBottom: i < venues.length - 1 ? '1px solid #F0EDE8' : 'none',
            }}>
              {editId === v.id ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 10, alignItems: 'center' }}>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(v.id)}
                    autoFocus
                    style={{ ...inputStyle, border: '1px solid #FF6E3C' }}
                  />
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(v.id)}
                    placeholder="Pris (kr)"
                    style={inputStyle}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => saveEdit(v.id)} disabled={saving} style={{
                      padding: '8px 14px', background: '#FF6E3C', color: 'white',
                      border: 'none', borderRadius: 8, fontSize: 13,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>Gem</button>
                    <button onClick={() => setEditId(null)} style={{
                      padding: '8px 14px', background: 'none', color: '#9B9189',
                      border: '1px solid #E9E6E1', borderRadius: 8, fontSize: 13,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>Annuller</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1C1A18' }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: '#9B9189', marginTop: 2 }}>
                      {v.price != null ? v.price.toLocaleString('da-DK') + ' kr standard' : 'Ingen standardpris'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => startEdit(v)} style={{
                      padding: '6px 12px', background: 'none', color: '#5C5650',
                      border: '1px solid #E9E6E1', borderRadius: 8, fontSize: 12,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>Redigér</button>
                    <button
                      onClick={() => deleteVenue(v.id, v.name)}
                      disabled={deletingId === v.id}
                      style={{
                        padding: '6px 12px', background: 'none', color: '#D94F3B',
                        border: '1px solid #E9E6E1', borderRadius: 8, fontSize: 12,
                        cursor: deletingId === v.id ? 'default' : 'pointer', fontFamily: 'inherit',
                      }}>
                      {deletingId === v.id ? '...' : 'Slet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
