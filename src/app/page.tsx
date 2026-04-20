'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    supabase.from('profiles').select('count').then(({ error }) => {
      setStatus(error ? 'error' : 'ok')
    })
  }, [])

  return (
    <main className="min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Vagtplan</h1>
        <p className="text-gray-500 text-sm mt-1">Uge 16 · April 2026</p>
      </header>

      <div className="p-4 rounded-xl border text-sm">
        {status === 'loading' && <span className="text-gray-400">Forbinder til database...</span>}
        {status === 'ok' && <span className="text-green-600 font-medium">✓ Database forbundet</span>}
        {status === 'error' && <span className="text-red-500 font-medium">✗ Kunne ikke forbinde til database</span>}
      </div>
    </main>
  )
}
