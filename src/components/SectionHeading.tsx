import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
}

export default function SectionHeading({ eyebrow, title, description, align = 'center' }: Props) {
  const alignment = align === 'center' ? 'text-center mx-auto items-center' : 'text-left items-start'
  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      <span className="text-eyebrow text-gold">{eyebrow}</span>
      <h2 className="font-wide text-3xl leading-tight font-black uppercase sm:text-4xl">{title}</h2>
      {description && <p className="text-base leading-relaxed text-cream-muted sm:text-lg">{description}</p>}
    </div>
  )
}
