const VISUAL_USE = ['雾里的灯', '雨天的窗', '深夜的灯塔', '海边的灯', '模糊的远景', '只有轮廓，没有细节']
const VISUAL_DONT = ['阳光', '笑脸', '彩虹', '向上指的箭头', '任何"积极向上"的意象']

export default function VisualLanguage() {
  return (
    <section className="py-32 px-6 bg-[#111118]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light tracking-wider text-white mb-4">
            视觉意象
          </h2>
          <p className="text-gray-500">
            我们用这些意象，避免那些意象
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-[rgba(196,212,228,0.05)] border border-[rgba(196,212,228,0.1)] rounded-2xl p-8">
            <h3 className="text-xl text-[#C4D4E4] mb-6">✓ 我们用</h3>
            <ul className="space-y-3">
              {VISUAL_USE.map((item, i) => (
                <li key={i} className="text-gray-400 flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-[#C4D4E4]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[rgba(107,122,143,0.05)] border border-[rgba(107,122,143,0.1)] rounded-2xl p-8">
            <h3 className="text-xl text-gray-500 mb-6">✗ 我们不用</h3>
            <ul className="space-y-3">
              {VISUAL_DONT.map((item, i) => (
                <li key={i} className="text-gray-600 line-through flex items-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Visual examples (CSS-based placeholders) */}
        <div className="grid grid-cols-3 gap-6">
          {['fog-light', 'rainy-window', 'lighthouse'].map((example, i) => (
            <div key={i} className="text-center">
              <div
                className={`h-32 rounded-2xl mb-3 ${example}`}
                style={{
                  background: i === 0
                    ? 'linear-gradient(180deg, rgba(107,122,143,0.3) 0%, rgba(107,122,143,0.1) 100%)'
                    : i === 1
                    ? 'linear-gradient(180deg, rgba(100,110,130,0.4) 0%, rgba(100,110,130,0.2) 100%)'
                    : 'linear-gradient(180deg, rgba(20,30,50,0.9) 0%, rgba(50,70,100,0.3) 100%)',
                }}
              />
              <p className="text-sm text-gray-500">
                {['雾里的灯', '雨天的窗', '深夜的灯塔'][i]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
