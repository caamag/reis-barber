import { Link } from 'react-router-dom'
import Crown from './Crown'
import { business } from '../data/business'

export default function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden py-28 sm:py-36">
      <img
        src="/images/interior.jpg"
        alt=""
        loading="lazy"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-ink/85" />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        <Crown className="h-10 w-auto text-gold" />
        <h2 className="mt-8 font-wide text-3xl leading-tight font-black uppercase sm:text-5xl">
          {business.slogan}
        </h2>
        <p className="mt-6 max-w-xl text-cream-muted sm:text-lg">
          Garanta seu horário em poucos cliques, direto pelo site.
        </p>
        <Link
          to="/schedules"
          className="mt-10 rounded-full bg-gold px-10 py-4 font-bold text-ink shadow-lg shadow-gold/20 transition-colors hover:bg-gold-light"
        >
          Agendar horário
        </Link>
      </div>
    </section>
  )
}
