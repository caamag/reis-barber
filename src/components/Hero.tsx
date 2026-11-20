import { ChevronDown, MapPin } from 'lucide-react'
import logo from '../assets/logo-dark.png'
import { business, whatsappLink } from '../data/business'

export default function Hero() {
  return (
    <section id="inicio" className="relative isolate flex min-h-svh items-center overflow-hidden">
      <img
        src="/images/hero-chair.jpg"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/80 via-ink/75 to-ink" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(18,18,18,0.7)_70%)]" />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-24 pb-20 text-center sm:px-6">
        <h1 className="sr-only">{business.name}</h1>
        {/* Recorta a margem transparente do PNG (1700x980) para a marca ocupar a largura toda */}
        <div className="relative aspect-[930/505] w-full max-w-[680px] overflow-hidden">
          <img
            src={logo}
            alt="Dos Reis Barbearia"
            className="absolute top-[-47.5%] left-[-40.86%] w-[182.8%] max-w-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
          />
        </div>

        <p className="mt-6 font-serif text-2xl text-cream italic sm:text-3xl">“{business.slogan}”</p>

        <p className="mt-5 flex items-center gap-2 text-sm text-cream-muted">
          <MapPin size={16} className="text-gold" />
          {business.address.city} · {business.openDays}
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gold px-8 py-4 font-bold text-ink shadow-lg shadow-gold/20 transition-colors hover:bg-gold-light"
          >
            Agendar pelo WhatsApp
          </a>
          <a
            href="#servicos"
            className="rounded-full border border-cream/30 px-8 py-4 font-semibold text-cream transition-colors hover:border-gold hover:text-gold"
          >
            Ver serviços
          </a>
        </div>
      </div>

      <a
        href="#servicos"
        aria-label="Rolar para serviços"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cream-muted motion-safe:animate-bounce hover:text-gold"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  )
}
