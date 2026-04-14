export default function FinalQuote() {
  return (
    <section className="py-32 px-6 bg-[#0c0c12] flex flex-col items-center">
      <div className="final-waves w-full max-w-2xl h-32 mb-12 opacity-30">
        <svg viewBox="0 0 800 150" className="w-full h-full">
          <path
            className="final-wave wave-1"
            d="M0,75 Q100,25 200,75 T400,75 T600,75 T800,75"
            fill="none"
            stroke="#6B7A8F"
            strokeWidth="1.5"
          />
          <path
            className="final-wave wave-2"
            d="M0,75 Q100,125 200,75 T400,75 T600,75 T800,75"
            fill="none"
            stroke="#A8B8C9"
            strokeWidth="1.5"
          />
          <path
            className="final-wave wave-3"
            d="M0,75 Q200,75 400,75 T800,75"
            fill="none"
            stroke="#C4D4E4"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-2xl text-white italic mb-4 tracking-wider">
          Stay in the flow, stay in the soul.
        </p>
        <p className="text-xl text-gray-500 mb-8">不为抵达，只为停留。</p>
        <p className="text-lg text-gray-400 mb-8">
          你不需要去任何地方。<br />
          你只需要在这里。<br />
          和情绪在一起。<br />
          和音乐在一起。<br />
          和你自己在一起。
        </p>
      </div>

      <div className="text-center mt-12">
        <span className="text-3xl font-light tracking-[0.3em] text-white">
          Moodify
        </span>
        <p className="text-gray-600 mt-4 text-sm">
          情绪的潮汐，终将抵达彼岸。
        </p>
      </div>
    </section>
  )
}
