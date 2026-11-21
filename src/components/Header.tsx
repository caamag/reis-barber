import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Crown from './Crown'

// Links com "/" na frente funcionam tanto na home quanto em outras páginas.
const links = [
  { href: '/#servicos', label: 'Serviços' },
  { href: '/#visite', label: 'Visite' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'border-b border-ink-line bg-ink/95 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3" aria-label="Dos Reis Barbearia — início">
          <Crown className="h-5 w-auto text-gold" />
          <span className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg text-gold italic">Dos</span>
            <span className="font-wide text-lg font-black tracking-tight">REIS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-cream-muted transition-colors hover:text-gold"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/schedules"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-gold-light"
          >
            Agendar
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-cream md:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink-line px-4 pb-6 md:hidden" aria-label="Menu móvel">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-base font-medium text-cream-muted hover:text-gold"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            to="/schedules"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-full bg-gold py-3 text-center font-bold text-ink"
          >
            Agendar horário
          </Link>
        </nav>
      )}
    </header>
  )
}
