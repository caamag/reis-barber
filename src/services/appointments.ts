import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import { db } from '../lib/firebase'
import { slotId } from '../lib/schedule'

/*
 * Estrutura no Firestore
 *
 * slots/{YYYY-MM-DD_HH:mm}   → público, SEM dados pessoais. Só marca que o horário está ocupado.
 *   { date, time, appointmentId, createdAt }
 *
 * appointments/{autoId}       → privado (só admin lê). Dados do cliente.
 *   { name, phone, service, date, time, slotId, status, createdAt }
 *
 * O id do slot é a própria data+hora. As regras do Firestore só permitem CRIAR um slot,
 * nunca sobrescrever. Então, se dois clientes tentarem o mesmo horário ao mesmo tempo,
 * o segundo recebe "permission-denied" e nada é gravado (o batch é atômico).
 */

export type NewAppointment = {
  name: string
  phone: string // só dígitos, ex: 11989323392
  service: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
}

export class SlotTakenError extends Error {
  constructor() {
    super('Este horário não está mais disponível.')
  }
}

/** Horários já ocupados de um dia. */
export async function fetchTakenTimes(date: string): Promise<Set<string>> {
  const snap = await getDocs(query(collection(db, 'slots'), where('date', '==', date)))
  return new Set(snap.docs.map((d) => d.data().time as string))
}

export async function createAppointment(data: NewAppointment): Promise<string> {
  const id = slotId(data.date, data.time)
  const appointmentRef = doc(collection(db, 'appointments'))
  const slotRef = doc(db, 'slots', id)

  const batch = writeBatch(db)
  batch.set(slotRef, {
    date: data.date,
    time: data.time,
    appointmentId: appointmentRef.id,
    createdAt: serverTimestamp(),
  })
  batch.set(appointmentRef, {
    name: data.name,
    phone: data.phone,
    service: data.service,
    date: data.date,
    time: data.time,
    slotId: id,
    status: 'scheduled',
    createdAt: serverTimestamp(),
  })

  try {
    await batch.commit()
  } catch (err) {
    // Slot já existe → a regra trata como "update", que é proibido.
    if (err instanceof FirebaseError && err.code === 'permission-denied') {
      throw new SlotTakenError()
    }
    throw err
  }
  return appointmentRef.id
}
