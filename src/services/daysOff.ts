import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

/*
 * daysOff/{YYYY-MM-DD}  → folgas da barbearia. O id do documento é a própria data.
 *   { date, reason, createdAt }
 * Leitura pública (o site do cliente precisa saber quais dias bloquear).
 * Criar/apagar: só usuários logados. As regras também impedem agendamentos nesses dias.
 */

export type DayOff = { date: string; reason: string }

/** Folgas de hoje em diante (usado pelo cliente e pelo admin). */
export async function fetchDaysOffFrom(fromDate: string): Promise<DayOff[]> {
  const snap = await getDocs(query(collection(db, 'daysOff'), where('date', '>=', fromDate)))
  return snap.docs
    .map((d) => ({ date: d.id, reason: (d.data().reason as string) ?? '' }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Cria uma folga para cada data informada (sobrescreve se já existir). */
export async function addDaysOff(dates: string[], reason: string) {
  for (let i = 0; i < dates.length; i += 450) {
    const batch = writeBatch(db)
    dates.slice(i, i + 450).forEach((date) =>
      batch.set(doc(db, 'daysOff', date), { date, reason: reason.trim(), createdAt: serverTimestamp() }),
    )
    await batch.commit()
  }
}

export function deleteDayOff(date: string) {
  return deleteDoc(doc(db, 'daysOff', date))
}

/** Apaga as folgas de dias anteriores a hoje. Retorna quantas foram removidas. */
export async function purgePastDaysOff(today: string): Promise<number> {
  const snap = await getDocs(query(collection(db, 'daysOff'), where('date', '<', today)))
  if (snap.empty) return 0
  const batch = writeBatch(db)
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
  return snap.size
}

/** Agendamentos já marcados entre duas datas (para avisar antes de criar a folga). Só admin. */
export async function appointmentsBetween(start: string, end: string) {
  const snap = await getDocs(
    query(collection(db, 'appointments'), where('date', '>=', start), where('date', '<=', end)),
  )
  return snap.docs.map((d) => d.data() as { name: string; date: string; time: string; service: string })
}
