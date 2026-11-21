import { collection, getDocs, onSnapshot, query, where, writeBatch, type DocumentReference } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type Appointment = {
  id: string
  name: string
  phone: string
  service: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  status: string
}

/**
 * Escuta em tempo real os agendamentos a partir de uma data (inclusive).
 * Só funciona para admins (regras do Firestore). A ordenação é feita no cliente
 * para não precisar de índice composto.
 */
export function subscribeAppointmentsFrom(
  fromDate: string,
  onData: (items: Appointment[]) => void,
  onError: (err: Error) => void,
) {
  const q = query(collection(db, 'appointments'), where('date', '>=', fromDate))
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Appointment, 'id'>) }))
        .filter((a) => a.status === 'scheduled')
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      onData(items)
    },
    onError,
  )
}

/**
 * Apaga do banco tudo que é de dias anteriores a `today` (YYYY-MM-DD):
 * os agendamentos (dados do cliente) e os horários ocupados (slots).
 * Agendamentos de hoje são mantidos, mesmo os que já passaram do horário.
 * Só funciona logado (regras do Firestore). Retorna quantos agendamentos foram apagados.
 */
export async function purgePastAppointments(today: string): Promise<number> {
  const [appointments, slots] = await Promise.all([
    getDocs(query(collection(db, 'appointments'), where('date', '<', today))),
    getDocs(query(collection(db, 'slots'), where('date', '<', today))),
  ])

  const refs: DocumentReference[] = [...appointments.docs.map((d) => d.ref), ...slots.docs.map((d) => d.ref)]
  if (refs.length === 0) return 0

  // Um batch do Firestore aceita no máximo 500 operações
  for (let i = 0; i < refs.length; i += 450) {
    const batch = writeBatch(db)
    refs.slice(i, i + 450).forEach((ref) => batch.delete(ref))
    await batch.commit()
  }
  return appointments.size
}
