export default function Tagline() {
  return (
    <p
      className="tagline text-xl md:text-2xl font-light text-gray-500 mb-2 tracking-wider text-center"
      style={{
        fontFamily: "'Noto Serif SC', serif",
        opacity: 0,
        animation: 'fadeInUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.5s forwards',
      }}
    >
      情绪的潮汐，终将抵达彼岸
    </p>
  )
}
