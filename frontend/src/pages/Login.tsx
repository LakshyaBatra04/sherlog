import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

type Mode = 'login' | 'register'

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
  return 'Something went wrong.'
}

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/', { replace: true })
  }, [navigate])

  function switchMode(next: Mode) {
    setMode(next)
    setMessage(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'register') {
        await api.post('/auth/register', { email, password })
        setMessage({ text: 'Account created — sign in below.', ok: true })
        switchMode('login')
        setPassword('')
      } else {
        const body = new URLSearchParams({ username: email, password })
        const { data } = await api.post('/auth/login', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        localStorage.setItem('token', data.access_token)
        navigate('/')
      }
    } catch (err: unknown) {
      setMessage({ text: extractDetail(err), ok: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <div className="mb-10">
          <p className="text-zinc-100 text-sm mb-1">sherlog</p>
          <p className="text-zinc-600 text-xs">async standup · work journal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="email"
            className="w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="password"
            className="w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
          />

          {message && (
            <p className={`text-xs ${message.ok ? 'text-emerald-500' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-100 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed text-zinc-900 text-xs font-medium py-2.5 transition-colors"
          >
            {loading ? '…' : mode === 'login' ? 'sign in' : 'create account'}
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-700">
          {mode === 'login' ? "no account? " : 'have an account? '}
          <button
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {mode === 'login' ? 'register' : 'sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
