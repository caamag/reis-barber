import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import Crown from '../../components/Crown'
import { useAuth } from '../../contexts/AuthContext'

function authErrorMessage(err: unknown) {
  const code = err instanceof FirebaseError ? err.code : ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'E-mail ou senha incorretos.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet.'
    case 'auth/user-disabled':
      return 'Este usuário foi desativado.'
    default:
      return 'Não foi possível entrar. Tente novamente.'
  }
}

const inputClass =
  'w-full rounded-lg border border-ink-line bg-ink py-3 pr-4 pl-11 outline-none placeholder:text-stone/60 focus:border-gold'

export default function Login() {
  const { user, loading, signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  if (!loading && user) return <Navigate to={from} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReset() {
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('Digite seu e-mail acima para receber o link de redefinição.')
      return
    }
    try {
      await resetPassword(email.trim())
      setInfo('Se este e-mail estiver cadastrado, você vai receber um link para redefinir a senha.')
    } catch (err) {
      setError(authErrorMessage(err))
    }
  }


  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden px-4 py-16">
      <img src="/images/hero-chair.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-ink/90" />

      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-cream-muted hover:text-gold">
          <ArrowLeft size={16} /> Voltar ao site
        </Link>

        <div className="rounded-2xl border border-ink-line bg-ink-soft/95 p-8 shadow-2xl shadow-black/60 backdrop-blur sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Crown className="h-8 w-auto text-gold" />
            <p className="mt-4 flex items-baseline gap-1.5">
              <span className="font-serif text-2xl text-gold italic">Dos</span>
              <span className="font-wide text-2xl font-black">REIS</span>
            </p>
            <span className="mt-1 text-eyebrow text-[0.65rem] text-cream-muted">Área do administrador</span>
          </div>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-cream-muted">E-mail</span>
                <div className="relative">
                  <Mail size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className={inputClass}
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-cream-muted">Senha</span>
                <div className="relative">
                  <Lock size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-stone hover:text-gold"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {error && (
                <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}
              {info && <p className="rounded-lg bg-gold/10 p-3 text-sm text-gold-light">{info}</p>}

              <button
                type="submit"
                disabled={submitting || loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gold py-3.5 font-bold text-ink transition-colors hover:bg-gold-light disabled:opacity-50"
              >
                {submitting && <Loader2 size={18} className="animate-spin" />}
                {submitting ? 'Entrando…' : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="text-center text-sm text-stone hover:text-gold"
              >
                Esqueci minha senha
              </button>
            </form>
        </div>
      </div>
    </main>
  )
}
