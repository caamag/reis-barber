// Dados centrais da barbearia. Altere aqui para refletir em todo o site.

export const business = {
  name: 'Dos Reis Barbearia',
  slogan: 'Venha viver a experiência de um rei',
  phoneDisplay: '(11) 98932-3392',
  phoneE164: '5511989323392',
  address: {
    street: 'Rua Santos Dumont, 1353',
    city: 'Ferraz de Vasconcelos',
    state: 'SP',
  },
  openDays: 'Sexta e sábado',
} as const

export const fullAddress = `${business.address.street} - ${business.address.city}, ${business.address.state}`

export const whatsappLink = (message = 'Olá! Gostaria de agendar um horário na Dos Reis Barbearia.') =>
  `https://wa.me/${business.phoneE164}?text=${encodeURIComponent(message)}`

export const phoneLink = `tel:+${business.phoneE164}`

export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`

export type Service = {
  name: string
  description: string
  image: string
}

export const services: Service[] = [
  {
    name: 'Corte de cabelo',
    description: 'Do clássico ao degradê moderno, com acabamento na tesoura e na máquina.',
    image: '/images/corte.jpg',
  },
  {
    name: 'Barba',
    description: 'Toalha quente, navalha e alinhamento para uma barba de respeito.',
    image: '/images/barba.jpg',
  },
  {
    name: 'Pezinho',
    description: 'Contorno da nuca e laterais para manter o corte sempre em dia.',
    image: '/images/pezinho.jpg',
  },
  {
    name: 'Sobrancelha',
    description: 'Limpeza e desenho na navalha, discreto e alinhado ao seu rosto.',
    image: '/images/sobrancelha.jpg',
  },
  {
    name: 'Luzes',
    description: 'Mechas e descoloração para dar personalidade ao visual.',
    image: '/images/luzes.jpg',
  },
]
