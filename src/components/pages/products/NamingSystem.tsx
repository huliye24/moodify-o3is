const LAYERS = [
  {
    number: '01',
    name: '蜷缩',
    sub: 'Coil',
    feeling: '核心感受：紧、沉、冷',
    tags: ['无力', '崩溃边缘', '什么都不想做', '只想躺着'],
    color: '#6B7A8F',
  },
  {
    number: '02',
    name: '迷茫',
    sub: 'Lost',
    feeling: '核心感受：不确定、悬浮',
    tags: ['不知道方向', '停在原地', '想走但不知道往哪'],
    color: '#7A8A9F',
  },
  {
    number: '03',
    name: '觉醒',
    sub: 'Awaken',
    feeling: '核心感受：看见了什么，还不清晰',
    tags: ['某句话击中了你', '突然明白了什么', '光透进来了'],
    color: '#A8B8C9',
  },
  {
    number: '04',
    name: '舒展',
    sub: 'Expand',
    feeling: '核心感受：打开了、呼吸',
    tags: ['微光', '可以呼吸了', '什么都不用做', '刚刚好'],
    color: '#C4D4E4',
  },
]

export default function NamingSystem() {
  return (
    <section className="py-32 px-6 bg-[#0c0c12]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light tracking-wider text-white mb-4">
            命名体系
          </h2>
          <p className="text-gray-500">
            四个情绪状态的定义
          </p>
        </div>

        <div className="space-y-6">
          {LAYERS.map((layer) => (
            <div
              key={layer.number}
              className="emotion-layer flex gap-8 p-6 rounded-2xl bg-[rgba(107,122,143,0.05)] border-l-4 transition-all hover:translate-x-4"
              style={{ borderLeftColor: layer.color }}
            >
              <div className="text-sm text-gray-600 font-mono pt-1">
                {layer.number}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-light text-white mb-1">
                  {layer.name}{' '}
                  <span className="text-sm text-gray-600 italic">{layer.sub}</span>
                </h3>
                <p className="text-gray-400 mb-4">{layer.feeling}</p>
                <div className="flex flex-wrap gap-2">
                  {layer.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs text-gray-500 bg-white/5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
