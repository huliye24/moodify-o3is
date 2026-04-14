export default function ScrollHint() {
  return (
    <div
      className="scroll-hind fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-gray-500 text-xs tracking-widest"
      style={{
        opacity: 0,
        animation: 'fadeIn 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 2.4s forwards',
      }}
    >
      <span>向下探索</span>
      <div className="scroll-line w-0.5 h-12 bg-gradient-to-b from-[#A8B8C9] to-transparent relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#C4D4E4] to-transparent"
          style={{
            animation: 'scrollPulse 2s ease-in-out infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes scrollPulse {
          0%, 100% { transform: translateY(-20px); opacity: 0; }
          50% { transform: translateY(20px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
