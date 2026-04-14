import BackToFlow from '../shared/BackToFlow'
import { VisualLanguage, CopyCases, FinalQuote } from './voice'

const PRINCIPLES = [
  {
    icon: '—',
    title: '克制',
    subtitle: 'Restraint',
    description: '我们不说"治愈"、"改善"、"解决"。我们说"陪伴"、"停留"、"呼吸"。',
    quote: '我们不是来拯救谁的。我们只是来陪一会儿。',
  },
  {
    icon: '◐',
    title: '诚实',
    subtitle: 'Honesty',
    description: '我们承认音乐不会"让一切变好"。我们不会说"一切都会过去"。',
    quote: '这个时刻很难。我们在这里。',
  },
  {
    icon: '○',
    title: '邀请',
    subtitle: 'Invitation',
    description: '我们不说"你应该"、"你需要"、"你必须"。我们说"你可以"、"你想吗"。',
    quote: '用户永远有选择。',
  },
]

const SLOGANS = [
  {
    main: 'Stay in the flow, stay in the soul.',
    sub: '不为抵达，只为停留。',
  },
  {
    main: '情绪的潮汐，终将抵达彼岸。',
    sub: '这不是承诺。这是规律。',
  },
]

const WE_SAY = ['陪伴', '停留', '呼吸', '接纳', '允许自己', '在这里', '没关系']
const WE_DONT = ['"治愈"', '"改善"', '"解决"', '"应该开心"', '"必须放松"', '"积极心态"', '"加油"']

const COLORS = [
  { name: '蜷缩', en: 'Coil', hex: '#6B7A8F', desc: '紧、沉、冷' },
  { name: '迷茫', en: 'Lost', hex: '#7A8A9F', desc: '不确定、悬浮' },
  { name: '觉醒', en: 'Awaken', hex: '#A8B8C9', desc: '看见了什么' },
  { name: '舒展', en: 'Expand', hex: '#C4D4E4', desc: '打开、松开' },
]

export default function VoicePage() {
  return (
    <div className="voice-page">
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center relative px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#111118] to-[#0a0a0f]">
          <div className="sound-waves h-full flex items-center justify-center gap-6 opacity-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="wave w-1 bg-[#A8B8C9]"
                style={{
                  height: `${40 + i * 20}px`,
                  animation: `soundWave 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light tracking-[0.35em] mb-4 text-white">
            品牌声音
          </h1>
          <p className="text-lg text-gray-500 italic mb-8">
            The Voice of Moodify
          </p>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#A8B8C9] to-transparent mx-auto mb-8" />
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Moodify 的声音，
            <br />
            <span className="text-white">不是营销语言，是价值观的呼吸。</span>
          </p>
        </div>

        <style>{`
          @keyframes soundWave {
            0%, 100% { transform: scaleY(0.5); opacity: 0.3; }
            50% { transform: scaleY(1); opacity: 1; }
          }
        `}</style>
      </section>

      {/* Principles */}
      <section className="py-32 px-6 bg-[#0c0c12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-light tracking-wider text-white mb-4">
              声音三原则
            </h2>
            <p className="text-gray-500">
              定义 Moodify 品牌声音的核心准则
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRINCIPLES.map((principle, index) => (
              <div
                key={principle.title}
                className="principle-card bg-[rgba(107,122,143,0.08)] backdrop-blur-lg border border-white/5 rounded-2xl p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-white/10"
              >
                <div className="text-4xl text-[#A8B8C9] mb-6 font-light">
                  {principle.icon}
                </div>
                <h3 className="text-2xl font-light text-white mb-2 tracking-wider">
                  {principle.title}
                </h3>
                <p className="text-sm text-gray-500 italic mb-6">
                  {principle.subtitle}
                </p>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {principle.description}
                </p>
                <div className="pt-6 border-t border-white/5">
                  <p className="text-sm text-[#A8B8C9] italic">
                    "{principle.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slogans */}
      <section className="py-32 px-6 bg-gradient-to-b from-[#0c0c12] to-[#111118]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light tracking-wider text-white mb-16">
            品牌口号
          </h2>

          {SLOGANS.map((slogan, i) => (
            <div key={i} className="mb-16 last:mb-0">
              <div className="tidal-animation h-16 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 border-t-2 border-[#6B7A8F] opacity-30 animate-tidalMove" />
                <div
                  className="absolute top-6 left-0 right-0 border-t-2 border-[#A8B8C9] opacity-50 animate-tidalMove"
                  style={{ animationDelay: '-1s' }}
                />
              </div>

              <div className="space-y-4">
                <p className="text-2xl text-gray-200 italic font-serif">
                  {slogan.main}
                </p>
                <p className="text-xl text-gray-500">{slogan.sub}</p>
              </div>
            </div>
          ))}

          <style>{`
            @keyframes tidalMove {
              0%, 100% { transform: translateX(-20px); opacity: 0.5; }
              50% { transform: translateX(20px); opacity: 1; }
            }
          `}</style>
        </div>
      </section>

      {/* Voice Map */}
      <section className="py-32 px-6 bg-[#0c0c12]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-wider text-white mb-4">
              语调坐标
            </h2>
            <p className="text-gray-500">
              Moodify 品牌声音的定位
            </p>
          </div>

          <div className="voice-diagram relative bg-[rgba(255,255,255,0.02)] rounded-2xl p-8">
            {/* Axes */}
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs text-gray-600 tracking-wider">低姿态</span>
              <span className="text-xs text-gray-600 tracking-wider">高姿态</span>
            </div>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              <span className="text-xs text-gray-600">暖</span>
              <span className="text-xs text-gray-600">冷</span>
            </div>

            {/* Quadrants */}
            <div className="grid grid-cols-2 gap-2 mt-8">
              {['教导', '评判', '讨好', '冷漠'].map((q, i) => (
                <div
                  key={q}
                  className="h-24 rounded border border-white/5 flex items-center justify-center text-sm text-gray-600"
                >
                  {q}
                </div>
              ))}
            </div>

            {/* Moodify Marker */}
            <div
              className="absolute w-4 h-4 rounded-full animate-pulse shadow-lg"
              style={{
                backgroundColor: '#A8B8C9',
                top: '65%',
                left: '30%',
                boxShadow: '0 0 20px rgba(168,184,201,0.5)',
              }}
            />
            <div
              className="absolute text-xs text-[#A8B8C9] tracking-wider"
              style={{ top: '70%', left: '25%' }}
            >
              Moodify
            </div>
          </div>

          <p className="text-center mt-8 text-gray-400">
            Moodify 的位置：<strong className="text-white">暖 + 低姿态 + 不确定</strong>
            <br />
            <span className="text-sm text-gray-600">温和、克制、邀请、不确定（承认我们不知道）</span>
          </p>
        </div>
      </section>

      {/* Don'ts */}
      <section className="py-32 px-6 bg-gradient-to-b from-[#0c0c12] to-[#111118]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-wider text-white mb-4">
              品牌禁止语
            </h2>
            <p className="text-gray-500">
              说什么，不说什么
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* We Say */}
            <div className="bg-[rgba(196,212,228,0.05)] border border-[rgba(196,212,228,0.1)] rounded-2xl p-8">
              <h3 className="text-xl text-[#C4D4E4] mb-6 tracking-wider">✓ 我们说</h3>
              <ul className="space-y-3">
                {WE_SAY.map((item, i) => (
                  <li key={i} className="text-gray-400 flex items-center gap-3">
                    <span className="w-1 h-1 rounded-full bg-[#C4D4E4]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* We Don't */}
            <div className="bg-[rgba(107,122,143,0.05)] border border-[rgba(107,122,143,0.1)] rounded-2xl p-8">
              <h3 className="text-xl text-gray-500 mb-6 tracking-wider">✗ 我们不说</h3>
              <ul className="space-y-3">
                {WE_DONT.map((item, i) => (
                  <li key={i} className="text-gray-600 line-through flex items-center gap-3">
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Color System */}
      <section className="py-32 px-6 bg-[#0c0c12]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-wider text-white mb-4">
              品牌色彩
            </h2>
            <p className="text-gray-500">
              Moodify 的情绪色谱
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {COLORS.map((color) => (
              <div key={color.hex} className="color-card text-center">
                <div
                  className="w-20 h-20 mx-auto rounded-full mb-4 shadow-lg cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => navigator.clipboard.writeText(color.hex)}
                  title="点击复制 HEX"
                />
                <h4 className="text-lg text-white mb-1">{color.name}</h4>
                <p className="text-sm text-gray-500 italic mb-1">{color.en}</p>
                <p className="text-xs text-gray-600 font-mono">{color.hex}</p>
              </div>
            ))}
          </div>

          <div className="color-gradient">
            <div
              className="h-3 rounded-full mx-auto max-w-md"
              style={{
                background: 'linear-gradient(90deg, #6B7A8F 0%, #7A8A9F 33%, #A8B8C9 66%, #C4D4E4 100%)',
              }}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-600 max-w-md mx-auto">
              <span>蜷缩</span>
              <span>迷茫</span>
              <span>觉醒</span>
              <span>舒展</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Language */}
      <VisualLanguage />

      {/* Copy Cases */}
      <CopyCases />

      {/* Final Quote */}
      <FinalQuote />

      {/* Back to Flow */}
      <BackToFlow />
    </div>
  )
}
