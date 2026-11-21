// Regras de agenda da barbearia. Ajuste aqui se o horário de funcionamento mudar.
// Se alterar, lembre de atualizar também o firestore.rules.

export const TIMEZONE = 'America/Sao_Paulo'
export const OPEN_WEEKDAYS = [2, 3, 4, 5, 6] // 0=domingo ... 6=sábado → terça a sábado
export const OPEN_MINUTES = 8 * 60 // 08:00
export const CLOSE_MINUTES = 20 * 60 // 20:00 (último horário começa às 19:40)
export const SLOT_MINUTES = 20
export const DAYS_AHEAD = 60 // janela de ~2 meses (as regras do Firestore aceitam até 65 dias)

const pad = (n: number) => String(n).padStart(2, '0')

export const minutesToTime = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** Todos os horários do dia: 08:00, 08:20, 08:40, ..., 19:40 */
export const ALL_TIMES: string[] = Array.from(
  { length: (CLOSE_MINUTES - OPEN_MINUTES) / SLOT_MINUTES },
  (_, i) => minutesToTime(OPEN_MINUTES + i * SLOT_MINUTES),
)

/** Data (YYYY-MM-DD) e minutos do dia atuais no fuso de São Paulo, independente do fuso do aparelho. */
export function nowInSaoPaulo(): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

/** Trabalha com datas como "YYYY-MM-DD" em UTC puro para evitar problemas de fuso. */
const parseDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
const formatDate = (dt: Date) => `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`

export const weekdayOf = (iso: string) => parseDate(iso).getUTCDay()

export function addDays(iso: string, days: number) {
  const dt = parseDate(iso)
  dt.setUTCDate(dt.getUTCDate() + days)
  return formatDate(dt)
}

export type DayOption = { date: string; weekday: string; day: string; month: string }

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Próximos dias de atendimento (terça a sábado) a partir de hoje. */
export function upcomingDays(): DayOption[] {
  const { date: today, minutes } = nowInSaoPaulo()
  const start = parseDate(today)
  const result: DayOption[] = []
  for (let i = 0; i <= DAYS_AHEAD; i++) {
    const dt = new Date(start)
    dt.setUTCDate(start.getUTCDate() + i)
    const iso = formatDate(dt)
    if (!OPEN_WEEKDAYS.includes(dt.getUTCDay())) continue
    // Pula hoje se não sobrou nenhum horário
    if (i === 0 && minutes >= CLOSE_MINUTES - SLOT_MINUTES) continue
    result.push({
      date: iso,
      weekday: WEEKDAYS[dt.getUTCDay()],
      day: pad(dt.getUTCDate()),
      month: MONTHS[dt.getUTCMonth()],
    })
  }
  return result
}

/** Horário já passou? (só relevante para o dia de hoje) */
export function isPast(date: string, time: string) {
  const now = nowInSaoPaulo()
  if (date !== now.date) return date < now.date
  return timeToMinutes(time) <= now.minutes
}

export function formatLongDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseDate(iso))
}

export const slotId = (date: string, time: string) => `${date}_${time}`
