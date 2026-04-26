type Props = {
  className?: string
  /** Set to true for a single-color (currentColor) version. */
  mono?: boolean
}

export function RisenSixMark({ className, mono = false }: Props) {
  const stroke = mono ? 'currentColor' : 'url(#rsGold)'
  const fill = mono ? 'currentColor' : 'url(#rsGold)'

  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Risen Six"
      className={className}
    >
      {!mono && (
        <defs>
          <linearGradient id="rsGold" x1="0" y1="0" x2="0" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F8DC91" />
            <stop offset="50%" stopColor="#C9962B" />
            <stop offset="100%" stopColor="#6B4515" />
          </linearGradient>
        </defs>
      )}

      <path d="M 102 22 L 110 6 L 118 22 L 120 4 L 122 22 L 130 6 L 138 22 Z" fill={fill} />

      <g fill="none" stroke={stroke} strokeWidth="9" strokeLinecap="round">
        <path d="M 58 205 C 25 130, 20 80, 60 78" />
        <path d="M 84 205 C 75 140, 70 70, 90 45" />
        <path d="M 108 205 C 105 130, 110 60, 116 28" />
        <path d="M 132 205 C 135 130, 130 60, 124 28" />
        <path d="M 156 205 C 165 140, 170 70, 150 45" />
        <path d="M 182 205 C 215 130, 220 80, 180 78" />
      </g>

      <line x1="52" y1="208" x2="188" y2="208" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
