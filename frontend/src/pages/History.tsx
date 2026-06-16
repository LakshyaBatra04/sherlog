import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

interface Entry {
  entry_id: number
  entry: string
  summary: string
}

export default function History() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    api
      .get<Entry[]>('/entries/user')
      .then(({ data }) => setEntries([...data].reverse()))
      .catch(() => setError('Failed to load entries.'))
      .finally(() => setLoading(false))
  }, [])

  function toggle(id: number) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <Layout>
      <p className="text-xs text-zinc-700 mb-8">
        {loading ? '…' : error ? '' : `${entries.length} entries`}
      </p>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <p className="text-sm text-zinc-700">no entries yet</p>
      )}

      {!loading && !error && entries.length > 0 && (
        <div>
          {entries.map((entry, i) => {
            const open = expanded === entry.entry_id
            return (
              <div key={entry.entry_id}>
                <button
                  className="w-full text-left py-5 group"
                  onClick={() => toggle(entry.entry_id)}
                >
                  <div className="flex items-start justify-between gap-8">
                    <p className="text-sm text-zinc-500 leading-relaxed flex-1 group-hover:text-zinc-300 transition-colors">
                      {entry.summary}
                    </p>
                    <span className="text-zinc-800 text-xs mt-0.5 shrink-0 group-hover:text-zinc-600 transition-colors">
                      {open ? '−' : '+'}
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="pb-5">
                    <pre className="text-xs font-mono text-zinc-700 whitespace-pre-wrap leading-relaxed">
                      {entry.entry}
                    </pre>
                  </div>
                )}

                {i < entries.length - 1 && <div className="border-b border-zinc-900" />}
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
