import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CalendarCheck, Check, ChevronDown, Download, Loader2, MapPin } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import DatePicker from '../components/DatePicker'
import { business, formatPrice, fullAddress, mapsDirectionsUrl, services, whatsappLink } from '../data/business'

const priceOf = (serviceName: string) => services.find((s) => s.name === serviceName)?.price ?? 0
import { ALL_TIMES, formatLongDate, isPast, nowInSaoPaulo, upcomingDays } from '../lib/schedule'
import { createAppointment, fetchTakenTimes, SlotTakenError } from '../services/appointments'
import { fetchDaysOffFrom } from '../services/daysOff'

const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 11)

function maskPhone(v: string) {
  const d = onlyDigits(v)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

type Confirmed = { id: string; name: string; phone: string; service: string; date: string; time: string }

function StepTitle({ n, children }: { n: number; children: string }) {
  return (
    <h2 className="flex items-center gap-3 font-wide text-sm font-black tracking-wide uppercase">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs text-ink">{n}</span>
      {children}
    </h2>
  )
}

export default function Schedules() {
  const [params] = useSearchParams()
  const days = useMemo(() => upcomingDays(), [])

  // Folgas cadastradas pelo admin: esses dias somem do calendário
  const [daysOff, setDaysOff] = useState<Set<string>>(new Set())
  useEffect(() => {
    fetchDaysOffFrom(nowInSaoPaulo().date)
      .then((list) => setDaysOff(new Set(list.map((d) => d.date))))
      .catch((err) => console.warn('Não foi possível carregar as folgas:', err))
  }, [])

  const availableDates = useMemo(() => days.map((d) => d.date).filter((d) => !daysOff.has(d)), [days, daysOff])

  const initialService = services.find((s) => s.name === params.get('servico'))?.name ?? ''
  const [service, setService] = useState(initialService)
  const [date, setDate] = useState(days[0]?.date ?? '')

  // Se a data escolhida virou folga (ex: a lista de folgas chegou depois), pula para o próximo dia livre
  useEffect(() => {
    if (date && daysOff.has(date)) {
      setDate(availableDates[0] ?? '')
      setTime('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysOff])
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const [taken, setTaken] = useState<Set<string>>(new Set())
  const [loadingTimes, setLoadingTimes] = useState(false)
  const [timesError, setTimesError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null)

  useEffect(() => {
    if (!date) return
    let cancelled = false
    setLoadingTimes(true)
    setTimesError('')
    fetchTakenTimes(date)
      .then((set) => !cancelled && setTaken(set))
      .catch((err) => {
        console.error('Erro ao carregar horários:', err)
        if (!cancelled) setTimesError('Não foi possível carregar os horários. Tente novamente.')
      })
      .finally(() => !cancelled && setLoadingTimes(false))
    return () => {
      cancelled = true
    }
  }, [date, reloadKey])

  const availableTimes = ALL_TIMES.map((t) => ({ time: t, free: !taken.has(t) && !isPast(date, t) }))
  const hasFreeTime = availableTimes.some((t) => t.free)

  const phoneDigits = onlyDigits(phone)
  const nameOk = name.trim().length >= 2
  const phoneOk = phoneDigits.length >= 10
  const canSubmit = Boolean(service && date && time && nameOk && phoneOk) && !submitting

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const id = await createAppointment({ name: name.trim(), phone: phoneDigits, service, date, time })
      setConfirmed({ id, name: name.trim(), phone: phoneDigits, service, date, time })
      window.scrollTo({ top: 0 })
    } catch (err) {
      if (err instanceof SlotTakenError) {
        setError(`${err.message} Escolha outro horário.`)
        setTime('')
        setReloadKey((k) => k + 1)
      } else {
        console.error(err)
        setError('Não foi possível concluir o agendamento. Tente novamente em instantes.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const [downloading, setDownloading] = useState(false)

  // O jsPDF só é baixado quando o cliente clica no botão
  async function handleDownload() {
    if (!confirmed) return
    setDownloading(true)
    try {
      const { downloadReceipt } = await import('../lib/receipt')
      downloadReceipt({ ...confirmed, price: priceOf(confirmed.service) })
    } catch (err) {
      console.error(err)
      alert('Não foi possível gerar o comprovante. Tente novamente.')
    } finally {
      setDownloading(false)
    }
  }

  function resetForm() {
    setConfirmed(null)
    setTime('')
    setReloadKey((k) => k + 1)
  }

  return (
    <>
      <Header />
      <main className="min-h-svh bg-ink pt-28 pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-cream-muted hover:text-gold">
            <ArrowLeft size={16} /> Voltar ao início
          </Link>

          {confirmed ? (
            <section className="mx-auto mt-10 max-w-xl rounded-2xl border border-gold/40 bg-ink-soft p-8 text-center sm:p-10">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-ink">
                <Check size={32} strokeWidth={3} />
              </span>
              <h1 className="mt-6 font-wide text-2xl font-black uppercase sm:text-3xl">Horário reservado!</h1>
              <p className="mt-3 text-cream-muted">
                Tudo certo, {confirmed.name.split(' ')[0]}. Te esperamos na barbearia.
              </p>

              <dl className="mt-8 grid gap-4 rounded-xl bg-ink p-6 text-left sm:grid-cols-2">
                <div>
                  <dt className="text-eyebrow text-[0.65rem] text-stone">Serviço</dt>
                  <dd className="mt-1 font-semibold">{confirmed.service}</dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-[0.65rem] text-stone">Horário</dt>
                  <dd className="mt-1 font-semibold">{confirmed.time}</dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-[0.65rem] text-stone">Data</dt>
                  <dd className="mt-1 font-semibold first-letter:uppercase">{formatLongDate(confirmed.date)}</dd>
                </div>
                <div>
                  <dt className="text-eyebrow text-[0.65rem] text-stone">Valor</dt>
                  <dd className="mt-1 font-semibold text-gold">
                    {formatPrice(priceOf(confirmed.service))} <span className="text-xs text-stone">· pago na barbearia</span>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-eyebrow text-[0.65rem] text-stone">Local</dt>
                  <dd className="mt-1 font-semibold">{fullAddress}</dd>
                </div>
              </dl>

              <p className="mt-6 text-sm text-stone">
                Precisa remarcar ou cancelar? Fale com a gente pelo{' '}
                <a href={whatsappLink()} target="_blank" rel="noreferrer" className="text-gold hover:text-gold-light">
                  WhatsApp {business.phoneDisplay}
                </a>
                .
              </p>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 font-bold text-ink shadow-lg shadow-gold/20 hover:bg-gold-light disabled:opacity-60"
              >
                {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {downloading ? 'Gerando comprovante…' : 'Baixar agendamento'}
              </button>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-cream/30 px-6 py-3 font-semibold hover:border-gold hover:text-gold"
                >
                  <MapPin size={18} /> Como chegar
                </a>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-full border border-cream/30 px-6 py-3 font-semibold hover:border-gold hover:text-gold"
                >
                  Fazer outro agendamento
                </button>
              </div>
            </section>
          ) : (
            <>
              <header className="mt-8 max-w-2xl">
                <span className="text-eyebrow text-gold">Agendamento</span>
                <h1 className="mt-3 font-wide text-3xl leading-tight font-black uppercase sm:text-4xl">
                  Reserve seu <span className="text-gold">trono</span>
                </h1>
                <p className="mt-4 text-cream-muted">
                  Escolha o serviço, o dia e o horário. Atendemos de {business.openDays.toLowerCase()}, das {business.openHours}.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex min-w-0 flex-col gap-10">
                  {/* 1. Serviço */}
                  <fieldset className="flex flex-col gap-4">
                    <legend className="sr-only">Serviço</legend>
                    <StepTitle n={1}>Serviço</StepTitle>
                    <label className="flex flex-col gap-2 sm:max-w-sm">
                      <span className="text-sm text-cream-muted">Qual serviço você quer fazer?</span>
                      <div className="relative">
                        <select
                          name="service"
                          required
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          className={`w-full cursor-pointer appearance-none rounded-lg border border-ink-line bg-ink-soft py-3 pr-12 pl-4 font-semibold transition-colors [color-scheme:dark] outline-none hover:border-gold/50 focus:border-gold ${
                            service ? 'text-cream' : 'text-stone/80'
                          }`}
                        >
                          <option value="" disabled>
                            Selecione um serviço
                          </option>
                          {services.map((s) => (
                            <option key={s.name} value={s.name} className="bg-ink-soft text-cream">
                              {s.name} — {formatPrice(s.price)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={20}
                          aria-hidden="true"
                          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gold"
                        />
                      </div>
                    </label>
                  </fieldset>

                  {/* 2. Data */}
                  <fieldset className="flex min-w-0 flex-col gap-4">
                    <legend className="sr-only">Data</legend>
                    <StepTitle n={2}>Data</StepTitle>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-cream-muted">Que dia fica melhor para você?</span>
                      <DatePicker
                        value={date}
                        availableDates={availableDates}
                        onChange={(d) => {
                          setDate(d)
                          setTime('')
                        }}
                      />
                    </div>
                  </fieldset>

                  {/* 3. Horário */}
                  <fieldset className="flex flex-col gap-4">
                    <legend className="sr-only">Horário</legend>
                    <StepTitle n={3}>Horário</StepTitle>
                    {loadingTimes ? (
                      <p className="flex items-center gap-2 text-sm text-stone">
                        <Loader2 size={16} className="animate-spin" /> Carregando horários…
                      </p>
                    ) : timesError ? (
                      <p className="text-sm text-red-300">
                        {timesError}{' '}
                        <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="underline">
                          Recarregar
                        </button>
                      </p>
                    ) : !hasFreeTime ? (
                      <p className="text-sm text-stone">Nenhum horário livre neste dia. Escolha outra data.</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {availableTimes.map(({ time: t, free }) => {
                          const active = time === t
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={!free}
                              onClick={() => setTime(t)}
                              aria-pressed={active}
                              className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                                active
                                  ? 'border-gold bg-gold text-ink'
                                  : free
                                    ? 'border-ink-line bg-ink-soft hover:border-gold/50'
                                    : 'cursor-not-allowed border-transparent bg-ink-soft/40 text-stone/40 line-through'
                              }`}
                            >
                              {t}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </fieldset>

                  {/* 4. Dados */}
                  <fieldset className="flex flex-col gap-4">
                    <legend className="sr-only">Seus dados</legend>
                    <StepTitle n={4}>Seus dados</StepTitle>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm text-cream-muted">Nome completo</span>
                        <input
                          type="text"
                          required
                          autoComplete="name"
                          maxLength={80}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome completo"
                          className="rounded-lg border border-ink-line bg-ink-soft px-4 py-3 outline-none placeholder:text-stone/60 focus:border-gold"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm text-cream-muted">Telefone / WhatsApp</span>
                        <input
                          type="tel"
                          required
                          autoComplete="tel-national"
                          inputMode="numeric"
                          value={phone}
                          onChange={(e) => setPhone(maskPhone(e.target.value))}
                          placeholder="(11) 90000-0000"
                          className="rounded-lg border border-ink-line bg-ink-soft px-4 py-3 outline-none placeholder:text-stone/60 focus:border-gold"
                        />
                      </label>
                    </div>
                  </fieldset>
                </div>

                {/* Resumo */}
                <aside className="h-fit rounded-2xl border border-ink-line bg-ink-soft p-6 lg:sticky lg:top-24">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <CalendarCheck size={18} className="text-gold" /> Resumo
                  </h2>
                  <dl className="mt-5 flex flex-col gap-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-stone">Serviço</dt>
                      <dd className="text-right font-semibold">{service || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-stone">Data</dt>
                      <dd className="text-right font-semibold first-letter:uppercase">{date ? formatLongDate(date) : '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-stone">Horário</dt>
                      <dd className="text-right font-semibold">{time || '—'}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 border-t border-ink-line pt-4">
                      <dt className="text-stone">Valor</dt>
                      <dd className="font-wide text-lg font-black text-gold">
                        {service ? formatPrice(priceOf(service)) : '—'}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-right text-xs text-stone">Pagamento na barbearia.</p>

                  {error && (
                    <p role="alert" className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold py-4 font-bold text-ink transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting && <Loader2 size={18} className="animate-spin" />}
                    {submitting ? 'Reservando…' : 'Confirmar agendamento'}
                  </button>
                  {!canSubmit && !submitting && (
                    <p className="mt-3 text-center text-xs text-stone">
                      {!service
                        ? 'Escolha um serviço'
                        : !time
                          ? 'Escolha um horário'
                          : !nameOk
                            ? 'Informe seu nome completo'
                            : 'Informe um telefone válido'}
                    </p>
                  )}
                </aside>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
