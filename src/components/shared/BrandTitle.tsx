export default function BrandTitle() {
  return (
    <h1
      className="brand-title text-6xl md:text-7xl font-light tracking-[0.4em] mb-6 text-center"
      style={{
        background: 'linear-gradient(180deg, #6B7A8F 0%, #8B9EB7 50%, #C4D4E4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        opacity: 0,
        animation: 'titleReveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.2s forwards',
      }}
    >
      Moodify
    </h1>
  )
}
