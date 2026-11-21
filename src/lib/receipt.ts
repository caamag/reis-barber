import { jsPDF } from 'jspdf'
import { business, formatPrice, fullAddress } from '../data/business'
import { formatLongDate } from './schedule'

export type ReceiptData = {
  id: string
  name: string
  phone: string // só dígitos
  service: string
  price: number
  date: string // YYYY-MM-DD
  time: string // HH:mm
}

// Paleta do projeto
const INK: [number, number, number] = [18, 18, 18]
const GOLD: [number, number, number] = [201, 162, 74]
const CREAM: [number, number, number] = [241, 237, 229]
const STONE: [number, number, number] = [120, 113, 104]
const LINE: [number, number, number] = [226, 221, 212]

function formatPhone(d: string) {
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return d
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Coroa da marca em vetor, centralizada em (cx, top). */
function drawCrown(doc: jsPDF, cx: number, top: number, w: number) {
  const s = w / 180 // o desenho original tem 180 de largura
  const p = (x: number, y: number): [number, number] => [cx - 90 * s + x * s, top + y * s]
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(9 * s)
  doc.setLineJoin('miter')
  const pts = [p(6, 12), p(48, 42), p(90, 4), p(132, 42), p(174, 12), p(164, 80), p(16, 80)]
  const [start, ...rest] = pts
  const segments = rest.map((pt, i) => [pt[0] - (i === 0 ? start : rest[i - 1])[0], pt[1] - (i === 0 ? start : rest[i - 1])[1]])
  doc.lines(segments, start[0], start[1], [1, 1], 'S', true)
  doc.setFillColor(...GOLD)
  const [bx, by] = p(20, 92)
  doc.rect(bx, by, 140 * s, 10 * s, 'F')
}

/** Monta o PDF do comprovante (A5 retrato). */
export function buildReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' })
  const W = doc.internal.pageSize.getWidth() // 148
  const M = 14 // margem lateral
  doc.setProperties({ title: `Agendamento ${business.name}`, author: business.name })

  // Cabeçalho escuro com a marca
  doc.setFillColor(...INK)
  doc.rect(0, 0, W, 52, 'F')
  drawCrown(doc, W / 2, 9, 20)

  doc.setFont('times', 'italic')
  doc.setFontSize(20)
  const dosW = doc.getTextWidth('Dos ')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  const reisW = doc.getTextWidth('REIS')
  const startX = W / 2 - (dosW + reisW) / 2
  doc.setFont('times', 'italic')
  doc.setFontSize(20)
  doc.setTextColor(...GOLD)
  doc.text('Dos', startX, 40)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...CREAM)
  doc.text('REIS', startX + dosW, 40)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(200, 190, 175)
  doc.setCharSpace(2.2)
  doc.text('BARBEARIA', W / 2, 46.5, { align: 'center' })
  doc.setCharSpace(0)

  // Título
  let y = 66
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...INK)
  doc.text('Comprovante de agendamento', M, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...STONE)
  doc.text(`Código: ${data.id}`, M, y)

  // Destaque: data e horário
  y += 7
  doc.setFillColor(...GOLD)
  doc.roundedRect(M, y, W - 2 * M, 22, 2.5, 2.5, 'F')
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('DATA', M + 6, y + 7)
  doc.text('HORÁRIO', W - M - 6, y + 7, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(capitalize(formatLongDate(data.date)), M + 6, y + 15)
  doc.setFontSize(18)
  doc.text(data.time, W - M - 6, y + 16, { align: 'right' })

  // Linhas de informação
  y += 32
  const rows: [string, string][] = [
    ['Cliente', data.name],
    ['Telefone', formatPhone(data.phone)],
    ['Serviço', data.service],
  ]
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...STONE)
    doc.text(label, M, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(value, W - M, y, { align: 'right', maxWidth: W - 2 * M - 30 })
    y += 4
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.3)
    doc.line(M, y, W - M, y)
    y += 7
  }

  // Valor
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...STONE)
  doc.text('Valor', M, y + 1)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(142, 107, 37) // dourado escuro, legível no branco
  doc.text(formatPrice(data.price), W - M, y + 1.5, { align: 'right' })
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...STONE)
  doc.text('Pagamento realizado na barbearia.', W - M, y, { align: 'right' })

  // Local e contato
  y += 10
  doc.setFillColor(246, 243, 237)
  doc.roundedRect(M, y, W - 2 * M, 30, 2.5, 2.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...INK)
  doc.text('Local', M + 5, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.text(fullAddress, M + 5, y + 12.5, { maxWidth: W - 2 * M - 10 })
  doc.setFont('helvetica', 'bold')
  doc.text('Contato / WhatsApp', M + 5, y + 20)
  doc.setFont('helvetica', 'normal')
  doc.text(business.phoneDisplay, M + 5, y + 25.5)

  // Rodapé
  const H = doc.internal.pageSize.getHeight()
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...STONE)
  doc.text(
    [
      'Chegue com alguns minutos de antecedência.',
      'Para remarcar ou cancelar, fale com a gente pelo WhatsApp.',
    ],
    W / 2,
    H - 22,
    { align: 'center' },
  )
  doc.setFont('times', 'italic')
  doc.setFontSize(10)
  doc.setTextColor(142, 107, 37)
  doc.text(`"${business.slogan}"`, W / 2, H - 12, { align: 'center' })

  return doc
}

export function receiptFileName(data: ReceiptData) {
  return `agendamento-dos-reis-${data.date}-${data.time.replace(':', 'h')}.pdf`
}

/** Gera e baixa o PDF no navegador. */
export function downloadReceipt(data: ReceiptData) {
  buildReceipt(data).save(receiptFileName(data))
}
