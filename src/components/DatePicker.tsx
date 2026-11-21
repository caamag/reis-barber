import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatLongDate } from '../lib/schedule'

type Props = {
  value: string // YYYY-MM-DD
  availableDates: string[] // datas que podem ser escolhidas (já ordenadas)
  onChange: (date: string) => void
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const pad = (n: number) => String(n).padStart(2, '0')
const monthKey = (iso: string) => iso.slice(0, 7) // YYYY-MM

/** Calendário em popover: navega por mês e só deixa clicar nos dias de atendimento. */
export default function DatePicker({ value, availableDates, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(monthKey(value || availableDates[0] || ''))
  const rootRef = useRef<HTMLDivElement>(null)

  const available = useMemo(() => new Set(availableDates), [availableDates])
  const months = useMemo(() => [...new Set(availableDates.map(monthKey))], [availableDates])
  const monthIndex = months.indexOf(viewMonth)

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Ao abrir, mostra o mês da data selecionada
  useEffect(() => {
    if (open && value) setViewMonth(monthKey(value))
  }, [open, value])

  const [year, month] = viewMonth.split('-').map(Number)
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const cells: (string | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${viewMonth}-${pad(i + 1)}`),
  ]

  return (
    <div ref={rootRef} className="relative sm:max-w-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-lg border bg-ink-soft py-3 pr-4 pl-4 text-left font-semibold transition-colors outline-none hover:border-gold/50 focus-visible:border-gold ${
          open ? 'border-gold' : 'border-ink-line'
        }`}
      >
        <CalendarDays size={20} className="shrink-0 text-gold" />
        <span className={`flex-1 first-letter:uppercase ${value ? 'text-cream' : 'text-stone/80'}`}>
          {value ? formatLongDate(value) : 'Selecione uma data'}
        </span>
        <ChevronDown size={20} className={`shrink-0 text-gold transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Escolher data"
          className="absolute top-full left-0 z-30 mt-2 w-full min-w-[300px] rounded-2xl border border-ink-line bg-ink-soft p-4 shadow-2xl shadow-black/60"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(months[monthIndex - 1])}
              disabled={monthIndex <= 0}
              aria-label="Mês anterior"
              className="rounded-full p-2 text-cream transition-colors hover:bg-ink hover:text-gold disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-wide text-sm font-black tracking-wide uppercase">
              {MONTHS[month - 1]} <span className="text-gold">{year}</span>
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(months[monthIndex + 1])}
              disabled={monthIndex >= months.length - 1}
              aria-label="Próximo mês"
              className="rounded-full p-2 text-cream transition-colors hover:bg-ink hover:text-gold disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="pb-2 text-xs font-semibold text-stone">
                {w}
              </span>
            ))}
            {cells.map((iso, i) => {
              if (!iso) return <span key={`empty-${i}`} />
              const enabled = available.has(iso)
              const selected = iso === value
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!enabled}
                  onClick={() => {
                    onChange(iso)
                    setOpen(false)
                  }}
                  aria-pressed={selected}
                  aria-label={formatLongDate(iso)}
                  className={`aspect-square rounded-lg text-sm font-semibold transition-colors ${
                    selected
                      ? 'bg-gold text-ink'
                      : enabled
                        ? 'text-cream hover:bg-gold/15 hover:text-gold'
                        : 'cursor-not-allowed text-stone/30'
                  }`}
                >
                  {Number(iso.slice(8))}
                </button>
              )
            })}
          </div>

          <p className="mt-3 border-t border-ink-line pt-3 text-xs text-stone">
            Atendemos de terça a sábado. Dias apagados não estão disponíveis.
          </p>
        </div>
      )}
    </div>
  )
}
