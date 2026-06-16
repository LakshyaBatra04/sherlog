import type { ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  function navLink(path: string, label: string) {
    const active = location.pathname === path
    return (
      <Link
        to={path}
        className={`text-xs transition-colors ${active ? 'text-zinc-100' : 'text-zinc-600 hover:text-zinc-400'}`}
      >
        {label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <nav className="px-6 py-5 border-b border-zinc-900">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xs text-zinc-100 tracking-wide">
            sherlog
          </Link>
          <div className="flex items-center gap-6">
            {navLink('/', 'journal')}
            {navLink('/history', 'history')}
            <button
              onClick={logout}
              className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
            >
              logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-xl mx-auto px-6 py-12">{children}</main>
    </div>
  )
}
