import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, CalendarOff, Clock, Loader2, Phone, Scissors, Wallet } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'
import { formatPrice, services } from '../../data/business'
import { addDays, formatLongDate, nowInSaoPaulo, timeToMinutes, weekdayOf } from '../../lib/schedule'
import { purgePastAppointments, subscribeAppointmentsFrom, type Appointment } from '../../services/adminAppointments'

type Filter = 'today' | 'week' | 'all'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Esta semana' },
  { id: 'all', label: 'Todos' },
]

const priceOf = (name: string) => services.find((s) => s.name === name)?.price ?? 0

function formatPhone(d: string) {
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return d
}

const whatsappTo = (phone: string, a: Appointment) =>
  `https://wa.me/55${phone}?text=${encodeURIComponent(
    `Olá, ${a.name.split(' ')[0]}! Aqui é da Dos Reis Barbearia, sobre seu horário de ${a.service} em ${formatLongDate(a.date)} às ${a.time}.`,
  )}`

export default function Dashboard() {
  const [filter, setFilter] = useState<Filter>('today')
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Atualiza o "agora" a cada minuto para esconder horários que já passaram
  const [now, setNow] = useState(nowInSaoPaulo)

  useEffect(() => {
    const id = setInterval(() => setNow(nowInSaoPaulo()), 60_000)
    return () => clearInterval(id)
  }, [])

  const today = now.date

  // Limpeza automática: ao abrir o painel (e quando o dia vira), apaga do banco
  // os agendamentos de dias que já passaram. Roda em segundo plano, sem travar a tela.
  useEffect(() => {
    purgePastAppointments(today)
      .then((count) => {
        if (count > 0) console.info(`Limpeza: ${count} agendamento(s) antigo(s) removido(s).`)
      })
      .catch((err) => console.warn('Limpeza de agendamentos antigos falhou:', err))
  }, [today])

  useEffect(() => {
    setLoading(true)
    return subscribeAppointmentsFrom(
      today,
      (data) => {
        setItems(data)
        setError('')
        setLoading(false)
      },
      (err) => {
        console.error(err)
        const code = (err as { code?: string }).code ?? 'desconhecido'
        const hint =
          code === 'permission-denied'
            ? 'As regras do Firestore estão bloqueando a leitura. Confira se a versão nova do firestore.rules foi publicada.'
            : code === 'failed-precondition'
              ? 'O Firestore pediu um índice. Abra o console do navegador (F12) e clique no link do erro para criá-lo.'
              : 'Tente recarregar a página.'
        setError(`Não foi possível carregar os agendamentos (${code}). ${hint}`)
        setLoading(false)
      },
    )
  }, [today])

  // Fim da semana atual (domingo)
  const weekEnd = addDays(today, (7 - weekdayOf(today)) % 7)

  // Só os que ainda não venceram (hoje, apenas horários futuros)
  const upcoming = useMemo(
    () => items.filter((a) => a.date > today || timeToMinutes(a.time) > now.minutes),
    [items, today, now.minutes],
  )

  const counts = {
    today: upcoming.filter((a) => a.date === today).length,
    week: upcoming.filter((a) => a.date <= weekEnd).length,
    all: upcoming.length,
  }

  const visible = upcoming.filter((a) =>
    filter === 'today' ? a.date === today : filter === 'week' ? a.date <= weekEnd : true,
  )

  const total = visible.reduce((sum, a) => sum + priceOf(a.service), 0)

  // Agrupa por dia
  const groups = visible.reduce<Record<string, Appointment[]>>((acc, a) => {
    ;(acc[a.date] ??= []).push(a)
    return acc
  }, {})

  const next = upcoming[0]

  return (
    <div className="min-h-svh bg-ink">
      <AdminHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-eyebrow text-gold">Painel</span>
            <h1 className="font-wide text-3xl font-black uppercase">Agendamentos</h1>
            <p className="text-cream-muted first-letter:uppercase">{formatLongDate(today)}</p>
          </div>
          <Link
            to="/admin/folgas"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/60 px-5 py-2.5 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            <CalendarOff size={18} /> Adicionar folga
          </Link>
        </div>

        {/* Destaques */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink-line bg-ink-soft p-5">
            <span className="flex items-center gap-2 text-sm text-stone">
              <Clock size={16} className="text-gold" /> Próximo cliente
            </span>
            {next ? (
              <>
                <p className="mt-2 font-wide text-xl font-black">{next.time}</p>
                <p className="truncate text-sm text-cream-muted">
                  {next.name} · {next.date === today ? 'hoje' : formatLongDate(next.date)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-cream-muted">Nenhum agendado</p>
            )}
          </div>
          <div className="rounded-2xl border border-ink-line bg-ink-soft p-5">
            <span className="flex items-center gap-2 text-sm text-stone">
              <CalendarDays size={16} className="text-gold" /> Agendamentos ({FILTERS.find((f) => f.id === filter)?.label.toLowerCase()})
            </span>
            <p className="mt-2 font-wide text-xl font-black">{visible.length}</p>
          </div>
          <div className="rounded-2xl border border-ink-line bg-ink-soft p-5">
            <span className="flex items-center gap-2 text-sm text-stone">
              <Wallet size={16} className="text-gold" /> Previsto ({FILTERS.find((f) => f.id === filter)?.label.toLowerCase()})
            </span>
            <p className="mt-2 font-wide text-xl font-black text-gold">{formatPrice(total)}</p>
          </div>
        </div>

        {/* Filtros */}
        <div role="tablist" aria-label="Filtrar agendamentos" className="mt-10 flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                  active ? 'border-gold bg-gold text-ink' : 'border-ink-line bg-ink-soft text-cream hover:border-gold/50'
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-ink/15 text-ink' : 'bg-ink text-stone'}`}
                >
                  {counts[f.id]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Lista */}
        <section className="mt-6">
          {loading ? (
            <p className="flex items-center gap-2 py-10 text-stone">
              <Loader2 size={18} className="animate-spin" /> Carregando agendamentos…
            </p>
          ) : error ? (
            <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-line py-16 text-center">
              <Scissors className="mx-auto text-stone" />
              <p className="mt-3 text-cream-muted">
                {filter === 'today'
                  ? 'Nenhum agendamento pendente para hoje.'
                  : filter === 'week'
                    ? 'Nenhum agendamento pendente nesta semana.'
                    : 'Nenhum agendamento pendente.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {Object.entries(groups).map(([date, list]) => (
                <div key={date}>
                  <h2 className="mb-3 flex items-center justify-between gap-4 border-b border-ink-line pb-2">
                    <span className="font-semibold first-letter:uppercase">
                      {date === today ? 'Hoje · ' : ''}
                      {formatLongDate(date)}
                    </span>
                    <span className="text-sm text-stone">
                      {list.length} {list.length === 1 ? 'cliente' : 'clientes'}
                    </span>
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {list.map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-col gap-3 rounded-xl border border-ink-line bg-ink-soft p-4 sm:flex-row sm:items-center"
                      >
                        <span className="w-fit rounded-lg bg-gold px-3 py-1.5 font-wide text-sm font-black text-ink">
                          {a.time}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{a.name}</p>
                          <p className="text-sm text-cream-muted">
                            {a.service} · <span className="text-gold">{formatPrice(priceOf(a.service))}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:+55${a.phone}`}
                            className="inline-flex items-center gap-2 rounded-full border border-ink-line px-3 py-2 text-sm text-cream-muted hover:border-gold hover:text-gold"
                          >
                            <Phone size={14} /> {formatPhone(a.phone)}
                          </a>
                          <a
                            href={whatsappTo(a.phone, a)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-[#25D366]/15 px-3 py-2 text-sm font-semibold text-[#5ee08f] hover:bg-[#25D366]/25"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
