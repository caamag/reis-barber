import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CalendarOff, Loader2, Plus, Trash2 } from 'lucide-react'
import AdminHeader from '../../components/AdminHeader'
import { addDays, formatLongDate, nowInSaoPaulo, OPEN_WEEKDAYS, weekdayOf } from '../../lib/schedule'
import {
  addDaysOff,
  appointmentsBetween,
  deleteDayOff,
  fetchDaysOffFrom,
  purgePastDaysOff,
  type DayOff,
} from '../../services/daysOff'

type Mode = 'single' | 'range'
const MAX_RANGE_DAYS = 90

const inputClass =
  'w-full rounded-lg border border-ink-line bg-ink py-3 px-4 [color-scheme:dark] outline-none focus:border-gold'

/** Dias de atendimento (terça a sábado) entre start e end, inclusive. */
function workingDaysBetween(start: string, end: string) {
  const days: string[] = []
  for (let d = start; d <= end && days.length <= MAX_RANGE_DAYS; d = addDays(d, 1)) {
    if (OPEN_WEEKDAYS.includes(weekdayOf(d))) days.push(d)
  }
  return days
}

type Conflict = { name: string; date: string; time: string; service: string }

export default function DaysOffPage() {
  const today = nowInSaoPaulo().date

  const [list, setList] = useState<DayOff[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  const [mode, setMode] = useState<Mode>('single')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [conflicts, setConflicts] = useState<Conflict[] | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setList(await fetchDaysOffFrom(today))
      setListError('')
    } catch (err) {
      console.error(err)
      setListError('Não foi possível carregar as folgas.')
    } finally {
      setLoading(false)
    }
  }, [today])

  // Ao entrar: apaga folgas que já passaram e carrega a lista
  useEffect(() => {
    purgePastDaysOff(today)
      .then((n) => n > 0 && console.info(`Limpeza: ${n} folga(s) antiga(s) removida(s).`))
      .catch((err) => console.warn('Limpeza de folgas antigas falhou:', err))
      .finally(load)
  }, [today, load])

  const selectedDates = (() => {
    if (!start) return []
    const last = mode === 'single' ? start : end
    if (!last || last < start) return []
    return workingDaysBetween(start, last)
  })()

  function resetForm() {
    setStart('')
    setEnd('')
    setReason('')
    setConflicts(null)
  }

  async function save() {
    setSaving(true)
    try {
      await addDaysOff(selectedDates, reason)
      setSuccess(
        selectedDates.length === 1
          ? `Folga adicionada em ${formatLongDate(selectedDates[0])}.`
          : `${selectedDates.length} dias de folga adicionados.`,
      )
      resetForm()
      await load()
    } catch (err) {
      console.error(err)
      setFormError('Não foi possível salvar a folga. Verifique se as regras do Firestore foram publicadas.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    setSuccess('')
    setConflicts(null)

    if (!start) return setFormError('Escolha a data.')
    if (start < today) return setFormError('Escolha uma data a partir de hoje.')
    if (mode === 'range') {
      if (!end) return setFormError('Escolha a data final.')
      if (end < start) return setFormError('A data final precisa ser depois da inicial.')
    }
    if (selectedDates.length === 0)
      return setFormError('Nenhum dia de atendimento (terça a sábado) no período escolhido.')
    if (selectedDates.length > MAX_RANGE_DAYS) return setFormError(`Escolha um período de até ${MAX_RANGE_DAYS} dias.`)

    // Avisa se já existem clientes agendados nesses dias
    setSaving(true)
    try {
      const found = (await appointmentsBetween(selectedDates[0], selectedDates[selectedDates.length - 1])).filter((a) =>
        selectedDates.includes(a.date),
      )
      if (found.length > 0) {
        setConflicts(found.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)))
        setSaving(false)
        return
      }
    } catch (err) {
      console.warn('Não foi possível verificar agendamentos existentes:', err)
    }
    await save()
  }

  async function handleDelete(date: string) {
    if (!window.confirm(`Remover a folga de ${formatLongDate(date)}? O dia volta a aceitar agendamentos.`)) return
    setDeleting(date)
    try {
      await deleteDayOff(date)
      setList((l) => l.filter((d) => d.date !== date))
    } catch (err) {
      console.error(err)
      alert('Não foi possível remover a folga.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-svh bg-ink">
      <AdminHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-cream-muted hover:text-gold">
          <ArrowLeft size={16} /> Voltar aos agendamentos
        </Link>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-eyebrow text-gold">Painel</span>
          <h1 className="font-wide text-3xl font-black uppercase">Folgas</h1>
          <p className="text-cream-muted">Nos dias de folga, os clientes não conseguem agendar.</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Formulário */}
          <section className="h-fit rounded-2xl border border-ink-line bg-ink-soft p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Plus size={18} className="text-gold" /> Adicionar folga
            </h2>

            <div role="tablist" className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-ink p-1">
              {(
                [
                  ['single', 'Um dia'],
                  ['range', 'Vários dias'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={mode === id}
                  onClick={() => {
                    setMode(id)
                    setConflicts(null)
                    setFormError('')
                  }}
                  className={`rounded-full py-2 text-sm font-semibold transition-colors ${
                    mode === id ? 'bg-gold text-ink' : 'text-cream-muted hover:text-gold'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div className={`grid gap-4 ${mode === 'range' ? 'sm:grid-cols-2' : ''}`}>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-cream-muted">{mode === 'range' ? 'De' : 'Data'}</span>
                  <input
                    type="date"
                    min={today}
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value)
                      setConflicts(null)
                    }}
                    className={inputClass}
                    required
                  />
                </label>
                {mode === 'range' && (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm text-cream-muted">Até</span>
                    <input
                      type="date"
                      min={start || today}
                      value={end}
                      onChange={(e) => {
                        setEnd(e.target.value)
                        setConflicts(null)
                      }}
                      className={inputClass}
                      required
                    />
                  </label>
                )}
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-cream-muted">
                  Motivo <span className="text-stone">(opcional, só você vê)</span>
                </span>
                <input
                  type="text"
                  maxLength={80}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Férias, feriado, consulta médica"
                  className={inputClass}
                />
              </label>

              {mode === 'range' && selectedDates.length > 0 && (
                <p className="text-sm text-stone">
                  {selectedDates.length} {selectedDates.length === 1 ? 'dia de atendimento' : 'dias de atendimento'}{' '}
                  (terça a sábado) no período.
                </p>
              )}

              {formError && (
                <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                  {formError}
                </p>
              )}
              {success && <p className="rounded-lg bg-gold/10 p-3 text-sm text-gold-light">{success}</p>}

              {conflicts ? (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                  <p className="flex items-start gap-2 text-sm font-semibold text-amber-200">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    Já existem {conflicts.length} {conflicts.length === 1 ? 'cliente agendado' : 'clientes agendados'}{' '}
                    nesse período:
                  </p>
                  <ul className="mt-3 flex flex-col gap-1 text-sm text-cream-muted">
                    {conflicts.map((c) => (
                      <li key={c.date + c.time}>
                        <span className="first-letter:uppercase">{formatLongDate(c.date)}</span>, {c.time} · {c.name} ·{' '}
                        {c.service}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-stone">
                    Os agendamentos continuam valendo. Avise esses clientes pelo WhatsApp no painel de agendamentos.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={save}
                      disabled={saving}
                      className="flex-1 rounded-full bg-gold py-2.5 text-sm font-bold text-ink hover:bg-gold-light disabled:opacity-50"
                    >
                      Adicionar mesmo assim
                    </button>
                    <button
                      type="button"
                      onClick={() => setConflicts(null)}
                      className="flex-1 rounded-full border border-ink-line py-2.5 text-sm font-semibold hover:border-gold hover:text-gold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-gold py-3.5 font-bold text-ink hover:bg-gold-light disabled:opacity-50"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? 'Salvando…' : 'Adicionar folga'}
                </button>
              )}
            </form>
          </section>

          {/* Lista */}
          <section>
            <h2 className="flex items-center justify-between border-b border-ink-line pb-3 font-semibold">
              Próximas folgas
              <span className="text-sm font-normal text-stone">{list.length}</span>
            </h2>

            {loading ? (
              <p className="flex items-center gap-2 py-8 text-stone">
                <Loader2 size={18} className="animate-spin" /> Carregando…
              </p>
            ) : listError ? (
              <p className="mt-4 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{listError}</p>
            ) : list.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-ink-line py-14 text-center">
                <CalendarOff className="mx-auto text-stone" />
                <p className="mt-3 text-cream-muted">Nenhuma folga marcada.</p>
              </div>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {list.map((d) => (
                  <li
                    key={d.date}
                    className="flex items-center gap-4 rounded-xl border border-ink-line bg-ink-soft p-4"
                  >
                    <CalendarOff size={20} className="shrink-0 text-gold" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold first-letter:uppercase">
                        {d.date === today ? 'Hoje · ' : ''}
                        {formatLongDate(d.date)}
                      </p>
                      {d.reason && <p className="truncate text-sm text-stone">{d.reason}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.date)}
                      disabled={deleting === d.date}
                      aria-label={`Remover folga de ${formatLongDate(d.date)}`}
                      className="rounded-full p-2 text-stone transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                    >
                      {deleting === d.date ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
