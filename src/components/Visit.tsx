import { CalendarDays, MapPin, Navigation, Phone } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { business, fullAddress, mapsDirectionsUrl, mapsEmbedUrl, phoneLink, whatsappLink } from '../data/business'

const week = [
  { day: 'Segunda', open: false },
  { day: 'Terça', open: false },
  { day: 'Quarta', open: false },
  { day: 'Quinta', open: false },
  { day: 'Sexta', open: true },
  { day: 'Sábado', open: true },
  { day: 'Domingo', open: false },
]

export default function Visit() {
  return (
    <section id="visite" className="bg-ink-soft py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Visite"
          title={
            <>
              Seu trono <span className="text-gold">está esperando</span>
            </>
          }
          description="Atendemos às sextas e sábados. Agende seu horário e venha conhecer a casa."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-2xl border border-ink-line bg-ink p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <MapPin className="mt-0.5 shrink-0 text-gold" size={22} />
                <div>
                  <h3 className="font-semibold">Endereço</h3>
                  <p className="mt-1 text-cream-muted">{business.address.street}</p>
                  <p className="text-cream-muted">
                    {business.address.city} - {business.address.state}
                  </p>
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-light"
                  >
                    <Navigation size={16} /> Como chegar
                  </a>
                </div>
              </div>

              <hr className="my-6 border-ink-line" />

              <div className="flex items-start gap-4">
                <Phone className="mt-0.5 shrink-0 text-gold" size={22} />
                <div>
                  <h3 className="font-semibold">Telefone e WhatsApp</h3>
                  <a href={phoneLink} className="mt-1 block text-cream-muted hover:text-gold">
                    {business.phoneDisplay}
                  </a>
                </div>
              </div>

              <hr className="my-6 border-ink-line" />

              <div className="flex items-start gap-4">
                <CalendarDays className="mt-0.5 shrink-0 text-gold" size={22} />
                <div className="w-full">
                  <h3 className="font-semibold">Dias de atendimento</h3>
                  <ul className="mt-3 grid grid-cols-7 gap-1.5">
                    {week.map((d) => (
                      <li
                        key={d.day}
                        title={`${d.day}: ${d.open ? 'aberto' : 'fechado'}`}
                        className={`flex flex-col items-center rounded-md py-2 text-xs font-bold ${
                          d.open ? 'bg-gold text-ink' : 'bg-ink-soft text-stone/60'
                        }`}
                      >
                        {d.day.slice(0, 3)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-stone">Atendimento com hora marcada pelo WhatsApp.</p>
                </div>
              </div>
            </div>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-gold py-4 text-center font-bold text-ink transition-colors hover:bg-gold-light"
            >
              Agendar meu horário
            </a>
          </div>

          <div className="min-h-[360px] overflow-hidden rounded-2xl border border-ink-line lg:col-span-3">
            <iframe
              title={`Mapa: ${fullAddress}`}
              src={mapsEmbedUrl}
              className="h-full min-h-[360px] w-full grayscale-[60%] invert-[90%] hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
