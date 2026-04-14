export default function ManifestoHook() {
  return (
    <a
      href="#foreword"
      className="manifesto-hook block max-w-lg mx-auto mt-16 text-center text-gray-400 hover:text-white transition-colors duration-500 group"
      style={{
        opacity: 0,
        animation: 'fadeInUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 2.1s forwards',
      }}
    >
      <span className="text-lg tracking-wider group-hover:tracking-widest transition-all">
        从 Prompt 到 Profit，
      </span>
      <br />
      <span className="text-lg tracking-wider group-hover:tracking-widest transition-all">
        记录 AI 做不到的事。
      </span>
    </a>
  )
}
