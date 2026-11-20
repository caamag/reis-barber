type Props = { className?: string }

// Coroa da marca, redesenhada em SVG para ficar nítida em qualquer tamanho.
export default function Crown({ className }: Props) {
  return (
    <svg viewBox="0 0 180 104" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 12 L48 42 L90 4 L132 42 L174 12 L164 80 H16 Z"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinejoin="miter"
      />
      <rect x="20" y="92" width="140" height="10" fill="currentColor" />
    </svg>
  )
}
