import { Album, Clock, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import BackToFlow from '../shared/BackToFlow'
import { AlbumDetail, NamingSystem } from './products'

const PRODUCT_TYPES = [
  {
    icon: Album,
    title: '情绪专辑',
    subtitle: 'Mood Albums',
    description: '每个情绪状态 = 一张专辑。8-12首演化循环音乐，约45-60分钟。',
    features: ['45-60分钟沉浸体验', '8-12首演化循环曲目', '完整情绪旅程'],
    color: '#6B7A8F',
    link: '/o3ics',
  },
  {
    icon: Clock,
    title: 'Moodify 时刻',
    subtitle: 'Mood Moments',
    description: '音乐 + 场景 + 意图。不是功能，是陪伴。',
    features: ['场景化情绪匹配', '智能推荐引擎', '随时聆听体验'],
    color: '#7A8A9F',
    link: '/o3ics',
  },
  {
    icon: Sparkles,
    title: 'Moodify 场景',
    subtitle: 'Mood Scenes',
    description: '情绪场景，不是使用场景。独处 / 等待 / 想念。',
    features: ['情绪场景库', '一键播放进入', '氛围营造'],
    color: '#A8B8C9',
    link: '/o3ics',
  },
  {
    icon: Users,
    title: 'Moodify 演化',
    subtitle: 'Mood Evolution',
    description: '情绪旅程，不是播放列表。音乐引导用户，跟随即可。',
    features: ['自适应情绪路径', 'AI智能演化', '个性化体验'],
    color: '#C4D4E4',
    link: '/o3ics',
  },
]

const MOOD_ALBUMS = [
  {
    mood: 'coil',
    title: '蜷缩',
    subtitle: 'Coil',
    color: '#6B7A8F',
    meta: [
      { label: '情绪层级', value: '第一层' },
      { label: '音乐时长', value: '45-60 分钟' },
      { label: '曲目数量', value: '8-12 首' },
    ],
    tracks: [
      { range: 'Track 1-3', desc: '蜷缩（低频包裹，循环不变）' },
      { range: 'Track 4', desc: '转折点（单音钢琴，像敲门）' },
      { range: 'Track 5-8', desc: '迷茫 → 觉醒（频率缓慢打开）' },
    ],
    scenes: ['失眠的夜晚', '情绪崩溃后', '什么都不想做的下午', '蜷在被子里的时候'],
  },
  {
    mood: 'lost',
    title: '迷茫',
    subtitle: 'Lost',
    color: '#7A8A9F',
    meta: [
      { label: '情绪层级', value: '第二层' },
      { label: '音乐时长', value: '45-60 分钟' },
      { label: '曲目数量', value: '8-12 首' },
    ],
    tracks: [
      { range: 'Track 1-2', desc: '迷茫的雾气（朦胧音效）' },
      { range: 'Track 3', desc: '寻找方向（上升旋律线）' },
      { range: 'Track 4-6', desc: '不确定中的微光' },
    ],
    scenes: ['站在岔路口', '想走但不知道方向', '静止的瞬间', '等待某个答案'],
  },
  {
    mood: 'awaken',
    title: '觉醒',
    subtitle: 'Awaken',
    color: '#A8B8C9',
    meta: [
      { label: '情绪层级', value: '第三层' },
      { label: '音乐时长', value: '45-60 分钟' },
      { label: '曲目数量', value: '8-12 首' },
    ],
    tracks: [
      { range: 'Track 1', desc: '黑暗中的一束光（钢琴独奏）' },
      { range: 'Track 2-4', desc: '逐渐清晰的和弦' },
      { range: 'Track 5-8', desc: '舒展的前奏（空间感打开）' },
    ],
    scenes: ['突然明白的瞬间', '光透进来了', '那句话击中了你', '顿悟的时刻'],
  },
  {
    mood: 'expand',
    title: '舒展',
    subtitle: 'Expand',
    color: '#C4D4E4',
    meta: [
      { label: '情绪层级', value: '第四层' },
      { label: '音乐时长', value: '45-60 分钟' },
      { label: '曲目数量', value: '8-12 首' },
    ],
    tracks: [
      { range: 'Track 1-3', desc: '舒展的开场（宽广音场）' },
      { range: 'Track 4-6', desc: '呼吸的节奏（长音铺底）' },
      { range: 'Track 7-8', desc: '平静的结束（渐弱消失）' },
    ],
    scenes: ['终于可以呼吸了', '肩膀放下来的时刻', '微光中的平静', '刚刚好的状态'],
  },
]

export default function ProductsPage() {
  return (
    <div className="products-page">
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center relative px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#12141a] to-[#0a0a0f]" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-light tracking-[0.35em] mb-4 text-white">
            情绪容器
          </h1>
          <p className="text-lg text-gray-500 italic mb-8">
            The Form of Emotion
          </p>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#A8B8C9] to-transparent mx-auto mb-8" />
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Moodify 不生产"好听的背景音"。
            <br />
            <span className="text-white font-light">我们制造"情绪的容器"。</span>
          </p>
        </div>
      </section>

      {/* Product Types */}
      <section className="py-32 px-6 bg-[#0c0c12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-light tracking-wider text-white mb-4">
              产品形态
            </h2>
            <p className="text-gray-500">
              四种不同的情绪体验方式
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PRODUCT_TYPES.map((product, index) => (
              <Link
                key={product.title}
                to={product.link}
                className="group block"
              >
                <div className="product-card bg-[rgba(107,122,143,0.08)] backdrop-blur-lg border border-white/5 rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/10 hover:shadow-2xl">
                  {/* 图标 */}
                  <div
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ backgroundColor: `${product.color}20` }}
                  >
                    <product.icon className="w-8 h-8" style={{ color: product.color }} />
                  </div>

                  {/* 标题 */}
                  <h3 className="text-2xl font-light text-white mb-2 tracking-wider text-center">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500 italic mb-6 text-center">
                    {product.subtitle}
                  </p>

                  {/* 描述 */}
                  <p className="text-gray-400 text-center leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* 特性列表 */}
                  <ul className="space-y-2">
                    {product.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-500"
                      >
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: product.color }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Album Details */}
      <section className="py-32 px-6 bg-[#0c0c12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-light tracking-wider text-white mb-4">
              情绪专辑详解
            </h2>
            <p className="text-gray-500">
              每一张专辑都是一次完整的情绪旅程
            </p>
          </div>

          <div className="space-y-24">
            {MOOD_ALBUMS.map((album) => (
              <AlbumDetail key={album.mood} {...album} />
            ))}
          </div>
        </div>
      </section>

      {/* Naming System */}
      <NamingSystem />

      {/* Back to Flow */}
      <BackToFlow />
    </div>
  )
}
