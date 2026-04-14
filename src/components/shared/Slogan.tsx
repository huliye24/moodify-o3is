export default function Slogan() {
  return (
    <p
      className="slogan text-sm text-gray-600 italic tracking-wider text-center"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        opacity: 0,
        animation: 'fadeIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.8s forwards',
      }}
    >
      Stay in the flow, stay in the soul.
    </p>
  )
}
