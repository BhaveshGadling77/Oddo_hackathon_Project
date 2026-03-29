export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Logo mark */}
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                stroke="#5a82ff"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M12 2V22M3 7L21 7M3 17L21 17"
                stroke="#5a82ff"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
            </svg>
          </div>
          {/* Spinner ring */}
          <svg
            className="absolute -inset-2 w-16 h-16 animate-spin"
            viewBox="0 0 64 64"
            fill="none"
          >
            <circle
              cx="32" cy="32" r="28"
              stroke="url(#spinGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="44 132"
            />
            <defs>
              <linearGradient id="spinGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2d54f5" />
                <stop offset="100%" stopColor="#2d54f5" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className="text-xs text-[var(--text-subtle)] font-mono tracking-widest uppercase">
          Loading
        </p>
      </div>
    </div>
  )
}
