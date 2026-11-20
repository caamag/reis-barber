import icon from '../assets/icon-crown.png'
import { business, fullAddress, phoneLink } from '../data/business'

export default function Footer() {
  return (
    <footer className="border-t border-ink-line bg-ink pt-12 pb-24 md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-4">
          <img src={icon} alt="" className="h-14 w-14" />
          <div>
            <p className="flex items-baseline gap-1.5">
              <span className="font-serif text-gold italic">Dos</span>
              <span className="font-wide font-black">REIS</span>
              <span className="ml-1 text-eyebrow text-[0.6rem] text-cream-muted">Barbearia</span>
            </p>
            <p className="mt-1 text-sm text-stone">{fullAddress}</p>
          </div>
        </div>

        <div className="text-sm text-stone">
          <a href={phoneLink} className="hover:text-gold">
            {business.phoneDisplay}
          </a>
          <p className="mt-1">© {new Date().getFullYear()} {business.name}. Todos os direitos reservados.</p>
          <p className="mt-1">
            Feito por{' '}
            <a
              href="https://www.caio.website/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-gold hover:text-gold-light"
            >
              caio.website
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
