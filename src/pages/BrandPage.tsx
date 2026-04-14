import { useEffect, useRef } from 'react'

// Intersection Observer 驱动滚动入场
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.08 }
    )

    const sections = container.querySelectorAll('.scroll-section')
    sections.forEach((s) => observer.observe(s))

    return () => observer.disconnect()
  }, [])

  return ref
}

// ===== ForewordSection =====
function ForewordSection() {
  return (
    <section
      className="scroll-section min-h-screen py-24 px-8 flex flex-col items-center"
      style={{ background: 'linear-gradient(180deg, #080e0a 0%, #0a140c 60%, #080e0a 100%)' }}
    >
      {/* 装饰波浪 */}
      <div className="w-full opacity-10 mb-12">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-8">
          <path d="M0,20 Q150,5 300,20 T600,20 T900,20 T1200,20" fill="none" stroke="rgba(93,185,122,0.5)" strokeWidth="1" />
        </svg>
      </div>

      <div className="max-w-2xl w-full">
        {/* 前言标题 */}
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.35em] mb-4 block" style={{ color: 'rgba(93,185,122,0.5)' }}>
            前言 · From Prompt to Profit
          </span>
          <h2
            className="text-3xl font-light leading-relaxed"
            style={{ fontFamily: "'Noto Serif SC', serif", color: '#C8F0D2' }}
          >
            两个词之间，<br />隔着一整个时代。
          </h2>
        </div>

        {/* 正文 */}
        <div
          className="space-y-6"
          style={{
            fontFamily: "'Noto Serif SC', serif",
            color: 'rgba(200,240,210,0.75)',
            lineHeight: 2.4,
            fontSize: '16px',
          }}
        >
          {[
            '2022年秋天，我在键盘上敲下第一个 Prompt。那一刻，我并不知道，一扇门正在打开。',
            '2025年春天，当 AI 开始批量替代白领工作，这个项目的意义变得不同了。',
            '这不是一本关于 AI 的书，这是一本关于人的书。',
            '在 AI 无所不能的叙事下，我选择记录那些 AI 做不到的事——那些需要用身体去感受、用时间去发酵、用真实的情感去填满的事。',
            'Moodify 是这个信念的第一个产品。',
            '我希望它不只是一款应用，而是一种提醒——提醒你在效率之外，还有情绪；提醒你在效率之外，还有身体；提醒你在效率之外，还有美。',
            '音乐，是情绪的容器。',
            'Moodify 是我的第一场实验。如果它能让你在某个深夜感到一丝被理解，那这场实验就已经成功了。',
          ].map((text, i) => (
            <p key={i} className="scroll-section">{text}</p>
          ))}
        </div>

        {/* 签名 */}
        <div className="mt-20 text-center" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          <p className="text-sm mb-4" style={{ color: 'rgba(93,185,122,0.6)' }}>欢迎登船。</p>
          <p className="text-xs" style={{ color: 'rgba(93,185,122,0.4)' }}>
            <strong>Moodify创始人</strong>
            <span className="ml-3">2026年4月</span>
          </p>
        </div>
      </div>
    </section>
  )
}

// ===== BoundarySection =====
function BoundarySection() {
  const quadrants = [
    {
      num: '01', title: '听觉基调', subtitle: 'Creamy Minimalism',
      doText: '新极简主义 + 奶油质感', desc: '模拟温暖的、带有"磨砂玻璃感"的音色。使用大量的 Ambient（氛围音）、Lo-Fi 采样。'
    },
    {
      num: '02', title: '旋律逻辑', subtitle: 'Breathing Flow',
      doText: '非效率竞争的"呼吸感"', desc: '采用长音（Drone）和慢速琶音。旋律不追求紧凑，而是追求"留白"。'
    },
    {
      num: '03', title: '编曲结构', subtitle: 'Evolving Loop',
      doText: '演化循环结构', desc: '使用循环（Looping）但带有细微变量的结构。蜷缩 → 觉醒 → 舒展。'
    },
    {
      num: '04', title: '情绪调性', subtitle: 'Cold with Warm Core',
      doText: '治愈系治愈（Healing Economy）', desc: '追求一种"中性偏冷但带有底温"的色彩。克制的温柔，像一双懂你的眼睛。'
    }
  ]

  const dos = [
    { dim: '节奏', do: '呼吸律动、心跳频率', dont: '工业重金属、高BPM舞曲' },
    { dim: '音色', do: '磨砂感、奶油色温、原声采样', dont: '尖锐、刺耳、纯塑料合成音' },
    { dim: '旋律', do: '长音、留白、慢速演化', dont: '紧凑副歌，洗脑hook' },
    { dim: '编曲', do: '演化循环、空间打开', dont: '传统A-B-A结构' },
    { dim: '目的', do: '心理按摩、情绪容纳、自我觉醒', dont: '纯粹消遣，洗脑传播、社交炫耀' },
    { dim: '感受', do: '"蜷缩"时的拥抱，"舒展"时的微风', dont: '虚伪的阳光、无意义的喧嚣' },
  ]

  return (
    <section
      className="scroll-section min-h-screen py-24 px-8"
      style={{ background: 'linear-gradient(180deg, #080e0a 0%, #0a140c 100%)' }}
    >
      {/* 四象限标题 */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.3em] mb-3 block" style={{ color: 'rgba(93,185,122,0.5)' }}>品牌哲学</span>
          <h2 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C8F0D2' }}>
            The Boundary of Sound
          </h2>
          <div className="w-16 h-px mx-auto mt-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(93,185,122,0.4), transparent)' }} />
        </div>

        {/* 四象限 */}
        <div className="grid grid-cols-2 gap-4">
          {quadrants.map((q, i) => (
            <div
              key={q.num}
              className="p-6 rounded-2xl scroll-section"
              style={{
                background: `linear-gradient(135deg, rgba(45,90,61,0.08), rgba(45,90,61,0.04))`,
                border: '1px solid rgba(93,185,122,0.14)',
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl font-light opacity-20" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{q.num}</span>
                <div className="text-right">
                  <h3 className="text-base font-medium text-gray-100">{q.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(93,185,122,0.5)' }}>{q.subtitle}</p>
                </div>
              </div>
              <div className="border-t border-gray-800/50 pt-4 space-y-2">
                <p className="text-sm font-medium" style={{ color: 'rgba(200,240,210,0.8)' }}>{q.doText}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(93,185,122,0.6)' }}>{q.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 边界清单 */}
      <div className="max-w-4xl mx-auto mb-16 scroll-section">
        <div className="text-center mb-8">
          <h3 className="text-xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C8F0D2' }}>边界清单</h3>
          <div className="w-12 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(93,185,122,0.4), transparent)' }} />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(93,185,122,0.12)' }}>
          {/* 表头 */}
          <div className="grid grid-cols-3 px-6 py-3" style={{ background: 'rgba(93,185,122,0.08)', borderBottom: '1px solid rgba(93,185,122,0.12)' }}>
            <span className="text-xs font-medium" style={{ color: 'rgba(93,185,122,0.7)' }}>维度</span>
            <span className="text-xs font-medium" style={{ color: 'rgba(93,185,122,0.7)' }}>我们要做什么</span>
            <span className="text-xs font-medium" style={{ color: 'rgba(93,185,122,0.7)' }}>我们坚决不做</span>
          </div>
          {dos.map((row, i) => (
            <div
              key={row.dim}
              className="grid grid-cols-3 px-6 py-3.5 border-t scroll-section"
              style={{
                borderColor: 'rgba(93,185,122,0.08)',
                background: i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'transparent',
                transitionDelay: `${i * 0.05}s`,
              }}
            >
              <span className="text-xs font-medium" style={{ color: 'rgba(200,240,210,0.9)' }}>{row.dim}</span>
              <span className="text-xs" style={{ color: 'rgba(200,240,210,0.6)' }}>{row.do}</span>
              <span className="text-xs line-through" style={{ color: 'rgba(93,185,122,0.4)' }}>{row.dont}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 演化循环结构 */}
      <div className="max-w-3xl mx-auto mb-16 scroll-section">
        <div className="text-center mb-8">
          <h3 className="text-xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C8F0D2' }}>演化循环结构</h3>
          <div className="w-12 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(93,185,122,0.4), transparent)' }} />
        </div>

        <div className="flex items-center justify-center gap-6">
          {[
            { label: '蜷缩', desc: '低频包裹，循环不变', color: '#2D5A3D' },
            { label: '转折点', desc: '单音钢琴，像敲门', color: '#3A7A52' },
            { label: '舒展', desc: '频率缓慢打开', color: '#C8F0D2' },
          ].map((phase, i) => (
            <div key={phase.label} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle, ${phase.color}20, transparent)`,
                    border: `1px solid ${phase.color}30`,
                  }}
                >
                  <svg viewBox="0 0 40 40" className="w-10 h-10">
                    <circle cx="20" cy="20" r={12 - i * 2} fill="none" stroke={phase.color} strokeWidth="0.5" opacity="0.5" />
                    <circle cx="20" cy="20" r={8 - i} fill={phase.color} opacity="0.3" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: phase.color }}>{phase.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(93,185,122,0.5)' }}>{phase.desc}</p>
                </div>
              </div>
              {i < 2 && (
                <div className="mx-2 opacity-30">
                  <svg viewBox="0 0 40 20" className="w-10 h-5">
                    <path d="M5,10 L30,10 M25,5 L30,10 L25,15" fill="none" stroke="rgba(93,185,122,0.6)" strokeWidth="1" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(93,185,122,0.5)' }}>
          循环 + 变量 = 演化。每一次循环，某个音色稍微变化。
        </p>
      </div>

      {/* 温度隐喻 */}
      <div className="max-w-xl mx-auto scroll-section">
        <div className="text-center mb-8">
          <h3 className="text-xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C8F0D2' }}>情绪温度</h3>
          <div className="w-12 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(93,185,122,0.4), transparent)' }} />
        </div>

        <div className="flex gap-8 items-center">
          {/* 杯子视觉 */}
          <div className="flex-shrink-0 w-32 h-40 relative">
            <div
              className="w-24 h-28 rounded-b-3xl mx-auto"
              style={{
                background: 'rgba(93,185,122,0.08)',
                border: '1px solid rgba(93,185,122,0.2)',
                boxShadow: 'inset 0 0 20px rgba(93,185,122,0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: '60%',
                  background: 'linear-gradient(180deg, rgba(93,185,122,0.15), rgba(93,185,122,0.25))',
                  borderRadius: '0 0 11px 11px',
                }}
              />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-2 rounded-full" style={{ background: 'rgba(93,185,122,0.15)' }} />
          </div>

          <div className="space-y-4" style={{ fontFamily: "'Noto Serif SC', serif", color: 'rgba(200,240,210,0.75)', fontSize: '14px', lineHeight: 2 }}>
            <p className="text-base font-medium" style={{ color: '#C8F0D2' }}>中性偏冷，但有底温</p>
            <p>想象冬天的一杯热水。</p>
            <p>杯子是冷的——我们不假装热情，不强迫你"开心"，不给你虚假的希望。</p>
            <p>但水是热的——温度在那里，只是没有沸腾。温和地陪着你。</p>
            <p className="text-sm" style={{ color: '#C8F0D2', fontStyle: 'italic' }}>不烫伤你，也不让你冷。</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ===== ProductsSection =====
function ProductsSection() {
  const productTypes = [
    {
      title: '情绪专辑', subtitle: 'Mood Albums',
      desc: '每个情绪状态 = 一张专辑。8-12首演化循环音乐，约45-60分钟。',
      icon: <svg viewBox="0 0 60 60" className="w-12 h-12"><circle cx="30" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="1" /><circle cx="30" cy="30" r="10" fill="currentColor" opacity="0.3" /><circle cx="30" cy="30" r="4" fill="currentColor" /></svg>
    },
    {
      title: 'Moodify 时刻', subtitle: 'Mood Moments',
      desc: '音乐 + 场景 + 意图。不是功能，是陪伴。',
      icon: <svg viewBox="0 0 60 60" className="w-12 h-12"><circle cx="30" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" /><path d="M30 14 L30 30 L44 30" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
    },
    {
      title: 'Moodify 场景', subtitle: 'Mood Scenes',
      desc: '情绪场景，不是使用场景。独处 / 等待 / 想念',
      icon: <svg viewBox="0 0 60 60" className="w-12 h-12"><rect x="10" y="18" width="40" height="28" fill="none" stroke="currentColor" strokeWidth="1" rx="2" /><circle cx="30" cy="32" r="8" fill="currentColor" opacity="0.3" /></svg>
    },
    {
      title: 'Moodify 演化', subtitle: 'Mood Evolution',
      desc: '情绪旅程，不是播放列表。音乐引导用户，跟随即可。',
      icon: <svg viewBox="0 0 60 60" className="w-12 h-12"><path d="M10 44 Q20 18 30 28 T50 14" fill="none" stroke="currentColor" strokeWidth="1" /><circle cx="10" cy="44" r="3" fill="currentColor" /><circle cx="30" cy="28" r="3" fill="currentColor" /><circle cx="50" cy="14" r="3" fill="currentColor" /></svg>
    },
  ]

  const interfacePrinciples = [
    {
      symbol: '○', title: '不催促',
      wrong: '"你想专注吗？点这个歌单。"',
      right: '"你今天想待在哪里？"',
    },
    {
      symbol: '◇', title: '不解释',
      wrong: '"这首音乐可以缓解焦虑"',
      right: '（没有文字，只有封套）',
    },
    {
      symbol: '◐', title: '不比较',
      wrong: '"你今天听了45分钟音乐"',
      right: '（没有数据，只有音乐）',
    },
  ]

  return (
    <section
      className="scroll-section min-h-screen py-24 px-8"
      style={{ background: 'linear-gradient(180deg, #080e0a 0%, #0a140c 100%)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* 产品类型 */}
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.3em] mb-3 block" style={{ color: 'rgba(93,185,122,0.5)' }}>情绪容器</span>
          <h2 className="text-2xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C8F0D2' }}>The Form of Emotion</h2>
          <div className="w-16 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(93,185,122,0.4), transparent)' }} />
          <p className="text-sm mt-4" style={{ color: 'rgba(200,240,210,0.6)' }}>
            Moodify 不生产"好听的背景音"。我们制造"情绪的容器"。
          </p>
        </div>

        {/* 产品类型卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-16">
          {productTypes.map((p, i) => (
            <div
              key={p.title}
              className="p-6 rounded-2xl scroll-section"
              style={{
                background: 'linear-gradient(135deg, rgba(93,185,122,0.05), rgba(93,185,122,0.02))',
                border: '1px solid rgba(93,185,122,0.12)',
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              <div className="mb-4" style={{ color: 'rgba(93,185,122,0.6)' }}>{p.icon}</div>
              <h3 className="text-base font-medium text-gray-100 mb-0.5">{p.title}</h3>
              <p className="text-xs mb-3" style={{ color: 'rgba(93,185,122,0.5)' }}>{p.subtitle}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(200,240,210,0.6)' }}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* 四层情绪命名 */}
        <div className="mb-16 scroll-section">
          <div className="text-center mb-8">
            <h3 className="text-xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C8F0D2' }}>情绪层级</h3>
            <div className="w-12 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(93,185,122,0.4), transparent)' }} />
          </div>

          <div className="space-y-3">
            {[
              { layer: '01', title: '蜷缩', en: 'Coil', feeling: '核心感受：紧、沉、静', tags: ['无力', '崩溃边缘', '什么都不想做', '只想躺着'], color: '#2D5A3D' },
              { layer: '02', title: '迷茫', en: 'Lost', feeling: '核心感受：不确定、悬浮', tags: ['不知道方向', '停在原地', '想走但不知道往哪'], color: '#3A7A52' },
              { layer: '03', title: '觉醒', en: 'Awaken', feeling: '核心感受：看见了什么，还不清晰', tags: ['某句话击中了你', '突然明白了什么', '光透进来了'], color: '#5BAD7A' },
              { layer: '04', title: '舒展', en: 'Expand', feeling: '核心感受：打开了，呼吸', tags: ['微光', '可以呼吸了', '什么都不用做', '刚刚好'], color: '#C8F0D2' },
            ].map((item) => (
              <div
                key={item.layer}
                className="flex items-start gap-5 p-5 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${item.color}10, ${item.color}04)`,
                  border: `1px solid ${item.color}20`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                  style={{ background: `${item.color}20`, color: item.color }}
                >
                  {item.layer}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h4 className="text-base font-medium" style={{ color: item.color }}>{item.title}</h4>
                    <span className="text-xs" style={{ color: 'rgba(93,185,122,0.4)' }}>{item.en}</span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'rgba(93,185,122,0.6)' }}>{item.feeling}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: `${item.color}10`, border: `1px solid ${item.color}20`, color: item.color }}
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

        {/* 界面哲学 */}
        <div className="scroll-section">
          <div className="text-center mb-8">
            <h3 className="text-xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C8F0D2' }}>界面哲学</h3>
            <div className="w-12 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(93,185,122,0.4), transparent)' }} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {interfacePrinciples.map((p, i) => (
              <div
                key={p.title}
                className="p-5 rounded-2xl text-center scroll-section"
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(93,185,122,0.1)',
                  transitionDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-xl"
                  style={{ background: 'rgba(93,185,122,0.1)', color: 'rgba(93,185,122,0.6)' }}
                >
                  {p.symbol}
                </div>
                <h4 className="text-sm font-medium text-gray-200 mb-4">{p.title}</h4>
                <div className="space-y-3 text-left">
                  <div>
                    <p className="text-xs line-through mb-1" style={{ color: 'rgba(93,185,122,0.35)' }}>{p.wrong}</p>
                    <p className="text-xs" style={{ color: 'rgba(93,185,122,0.4)' }}>✗ 错误</p>
                  </div>
                  <div>
                    <p className="text-xs italic" style={{ color: 'rgba(200,240,210,0.5)' }}>{p.right}</p>
                    <p className="text-xs font-medium" style={{ color: '#C8F0D2' }}>✓ Moodify</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ===== BrandPage =====
export default function BrandPage() {
  const ref = useScrollReveal()

  return (
    <div ref={ref} className="h-full overflow-y-auto">
      <ForewordSection />
      <div style={{ background: 'linear-gradient(180deg, #080e0a, #0a140c)' }}>
        <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="w-full h-6 opacity-10">
          <path d="M0,15 Q300,5 600,15 T1200,15" fill="none" stroke="rgba(93,185,122,0.4)" strokeWidth="1" />
        </svg>
      </div>
      <BoundarySection />
      <div style={{ background: 'linear-gradient(180deg, #080e0a, #0a140c)' }}>
        <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="w-full h-6 opacity-10">
          <path d="M0,15 Q300,5 600,15 T1200,15" fill="none" stroke="rgba(93,185,122,0.4)" strokeWidth="1" />
        </svg>
      </div>
      <ProductsSection />

      {/* 底部回到情绪 */}
      <div
        className="py-16 text-center scroll-section"
        style={{ background: 'linear-gradient(180deg, #0a140c 0%, #080e0a 100%)' }}
      >
        <div className="w-px h-8 mx-auto mb-8" style={{ background: 'linear-gradient(180deg, rgba(93,185,122,0.3), transparent)' }} />
        <p className="text-sm mb-6" style={{ color: 'rgba(93,185,122,0.4)', fontFamily: "'Noto Serif SC', serif" }}>
          欢迎登船。
        </p>
        <svg viewBox="0 0 120 120" className="w-20 h-20 mx-auto opacity-30">
          <defs>
            <linearGradient id="tidalGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2D5A3D" />
              <stop offset="100%" stopColor="#8FD4A8" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M10,${30 + i * 15} Q30,${20 + i * 15} 50,${30 + i * 15} T90,${30 + i * 15} T130,${30 + i * 15}`}
              fill="none"
              stroke="url(#tidalGrad3)"
              strokeWidth="2"
              style={{ animation: `waveMove ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </svg>
      </div>
    </div>
  )
}
