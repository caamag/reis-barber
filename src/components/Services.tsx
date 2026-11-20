import SectionHeading from './SectionHeading'
import { services, whatsappLink } from '../data/business'

export default function Services() {
  return (
    <section id="servicos" className="bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Serviços"
          title={
            <>
              Cuidado de <span className="text-gold">rei</span>, do corte à barba
            </>
          }
          description="Cada atendimento é feito com calma, técnica e atenção aos detalhes. Escolha o seu serviço e agende direto pelo WhatsApp."
        />

        <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {services.map((s, i) => (
            <li
              key={s.name}
              className={`group relative overflow-hidden rounded-2xl border border-ink-line bg-ink-soft ${
                i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
              } ${i === 4 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale-[35%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-soft via-ink-soft/20 to-transparent" />
              </div>
              <div className="relative -mt-10 flex flex-col gap-2 p-6">
                <span className="font-wide text-xs font-bold text-gold">0{i + 1}</span>
                <h3 className="font-wide text-xl font-black uppercase">{s.name}</h3>
                <p className="text-sm leading-relaxed text-cream-muted">{s.description}</p>
                <a
                  href={whatsappLink(`Olá! Gostaria de agendar: ${s.name}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-fit items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light"
                >
                  Agendar {s.name.toLowerCase()} →
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
