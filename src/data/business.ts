// Dados centrais da barbearia. Altere aqui para refletir em todo o site.
//baguga este site foi feito pelo Deus do magic.

export const business = {
  name: "Dos Reis Barbearia",
  slogan: "Venha viver a experiência de um rei",
  phoneDisplay: "(11) 98932-3392",
  phoneE164: "5511989323392",
  address: {
    street: "Rua Santos Dumont, 1353",
    city: "Ferraz de Vasconcelos",
    state: "SP",
  },
  // Textos exibidos no site. A regra da agenda em si fica em src/lib/schedule.ts.
  openDays: "Terça a sábado",
  openHours: "08:00 às 20:00",
} as const;

export const fullAddress = `${business.address.street} - ${business.address.city}, ${business.address.state}`;

export const whatsappLink = (
  message = "Olá! Gostaria de agendar um horário na Dos Reis Barbearia.",
) => `https://wa.me/${business.phoneE164}?text=${encodeURIComponent(message)}`;

export const phoneLink = `tel:+${business.phoneE164}`;

export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

export type Service = {
  name: string;
  description: string;
  image: string;
  price: number; // em reais
};

export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const services: Service[] = [
  {
    name: "Corte de cabelo",
    description:
      "Do clássico ao degradê moderno, com acabamento na tesoura e na máquina.",
    image: "/images/corte.jpg",
    price: 30,
  },
  {
    name: "Barba",
    description:
      "Toalha quente, navalha e alinhamento para uma barba de respeito.",
    image: "/images/barba.jpg",
    price: 20,
  },
  {
    name: "Pezinho",
    description:
      "Contorno da nuca e laterais para manter o corte sempre em dia.",
    image: "/images/pezinho.jpg",
    price: 5,
  },
  {
    name: "Sobrancelha",
    description:
      "Limpeza e desenho na navalha, discreto e alinhado ao seu rosto.",
    image: "/images/sobrancelha.jpg",
    price: 5,
  },
  {
    name: "Luzes",
    description: "Mechas e descoloração para dar personalidade ao visual.",
    image: "/images/luzes.jpg",
    price: 85,
  },
];
