import { useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

type EntryType = 'journal' | 'standup'

interface SummaryResult {
  summary: string
}

const PLACEHOLDERS: Record<EntryType, string> = {
  standup: '- Yesterday: …\n- Today: …\n- Blockers: …',
  journal: 'What did you work on?',
}

function extractDetail(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'response' in err &&
    err.response &&
    typeof err.response === 'object' &&
    'data' in err.response &&
    err.response.data &&
    typeof err.response.data === 'object' &&
    'detail' in err.response.data
  ) {
    return String((err.response.data as { detail: unknown }).detail)
  }
  return 'Failed to submit.'
}

export default function Journal() {
  const [content, setContent] = useState('')
  const [type, setType] = useState<EntryType>('journal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SummaryResult | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const { data: created } = await api.post('/entries', { content, type })
      const { data: entry } = await api.get(`/entries/${created.id}`)
      setResult({ summary: entry.summary })
      setContent('')
    } catch (err: unknown) {
      setError(extractDetail(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="flex items-center gap-5 mb-8">
        {(['journal', 'standup'] as EntryType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setResult(null) }}
            className={`text-xs pb-px transition-colors capitalize ${
              type === t
                ? 'text-zinc-100 border-b border-zinc-400'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          placeholder={PLACEHOLDERS[type]}
          className="w-full bg-transparent text-sm font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none resize-none leading-relaxed"
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="text-xs text-zinc-600 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300 disabled:opacity-25 disabled:cursor-not-allowed px-4 py-1.5 transition-colors"
        >
          {loading ? 'submitting…' : 'submit'}
        </button>
      </form>

      {result && (
        <div className="mt-12 pl-3 border-l border-zinc-800">
          <p className="text-xs text-zinc-700 mb-2">summary</p>
          <p className="text-sm text-zinc-500 leading-relaxed">{result.summary}</p>
        </div>
      )}
    </Layout>
  )
}
