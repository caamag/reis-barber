import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Crown from './Crown'
import { useAuth } from '../contexts/AuthContext'

export default function AdminHeader() {
  const { user, signOut } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/admin" className="flex items-center gap-3" aria-label="Ir para o painel">
          <Crown className="h-5 w-auto text-gold" />
          <span className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg text-gold italic">Dos</span>
            <span className="font-wide text-lg font-black">REIS</span>
          </span>
          <span className="hidden rounded-full border border-gold/40 px-2 py-0.5 text-[0.65rem] font-bold tracking-widest text-gold uppercase sm:inline">
            Admin
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-stone md:inline">{user?.email}</span>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm font-semibold hover:border-gold hover:text-gold"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>
    </header>
  )
}
