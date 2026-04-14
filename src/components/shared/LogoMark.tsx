export default function LogoMark() {
  return (
    <div className="logo-mark mx-auto mb-8">
      <svg viewBox="0 0 120 120" className="w-32 h-32">
        <defs>
          <linearGradient id="tidalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6B7A8F' }} />
            <stop offset="50%" style={{ stopColor: '#8B9EB7' }} />
            <stop offset="100%" style={{ stopColor: '#C4D4E4' }} />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            className="tidal-wave"
            d={`M10,${30 + i * 15} Q30,${20 + i * 15} 50,${30 + i * 15} T90,${30 + i * 15} T130,${30 + i * 15}`}
            fill="none"
            stroke="url(#tidalGrad)"
            strokeWidth="3"
            style={{
              strokeDasharray: 200,
              strokeDashoffset: 200,
              animation: `drawWave 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              animationDelay: `${0.6 + i * 0.2}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes drawWave {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </svg>
    </div>
  )
}
