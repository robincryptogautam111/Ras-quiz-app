export default function Logo({ size = 'md', showText = true }) {
  const dim = size === 'sm' ? 28 : size === 'lg' ? 44 : 36
  const textCls = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'

  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{ width: dim, height: dim }}
        className="relative rounded-xl bg-navy-900 dark:bg-navy-800 flex items-center justify-center
                   border border-navy-700/40 dark:border-white/10 shadow-glow-gold"
      >
        <svg viewBox="0 0 24 24" width={dim * 0.55} height={dim * 0.55} aria-hidden>
          <path
            d="M7 4h7a4.5 4.5 0 0 1 1.4 8.78L19 20h-3l-3.3-7H10v7H7V4Zm3 3v3h3.7a1.5 1.5 0 0 0 0-3H10Z"
            fill="url(#g)"
          />
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#ffd166" />
              <stop offset="1" stopColor="#f59008" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <div className="leading-none">
          <div className={`font-display font-extrabold tracking-tight ${textCls}`}>
            RAS <span className="gold-text">Arena</span>
          </div>
          {size !== 'sm' && (
            <div className="text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--text-faint))] mt-0.5">
              Smarter Practice • Bigger Wins
            </div>
          )}
        </div>
      )}
    </div>
  )
}
