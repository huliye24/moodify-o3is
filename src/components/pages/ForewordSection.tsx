import { useState, useEffect } from 'react'

export default function ForewordSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      id="foreword"
      className={`py-32 px-6 relative transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* 装饰性引号 */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-[200px] text-white/[0.02] font-serif select-none pointer-events-none">
        "
      </div>

      <div className="max-w-3xl mx-auto relative">
        {/* 章节标题 */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs tracking-[0.3em] text-white/30 uppercase mb-4">
            前言 · From Prompt to Profit
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-wide text-white leading-relaxed">
            两个词之间，
            <br />
            <span className="text-white/60">隔着一整个时代。</span>
          </h2>
        </div>

        {/* 内容区域 */}
        <div className="prose-custom space-y-6 text-gray-400 leading-loose text-lg">
          <p className="text-gray-300/80 leading-relaxed">
            2022年秋天，我在键盘上敲下第一个 Prompt。
            那一刻，我并不知道，一扇门正在打开。
          </p>

          <p className="text-gray-300/80 leading-relaxed">
            2025年春天，当 AI 开始批量替代白领工作，
            这个项目的意义变得不同了。
          </p>

          <div className="py-8 my-8 border-y border-white/5">
            <p className="text-center text-white/90 text-xl italic font-serif">
              这不是一本关于 AI 的书，
              <br />
              这是一本关于<span className="text-[#A8B8C9]">人</span>的书。
            </p>
          </div>

          <p className="text-gray-300/80 leading-relaxed">
            在 AI 无所不能的叙事下，我选择记录那些
            <span className="text-white/60">AI 做不到的事</span>——
            那些需要用身体去感受、用时间去发酵、
            用真实的情感去填满的事。
          </p>

          <p className="text-gray-300/80 leading-relaxed">
            Moodify 是这个信念的第一个产品。
          </p>

          <p className="text-gray-300/80 leading-relaxed">
            我希望它不只是一款应用，而是一种
            <span className="text-white/60">提醒</span>——
          </p>

          <ul className="space-y-3 text-gray-400/80 pl-6 list-none">
            <li className="relative pl-6">
              <span className="absolute left-0 text-[#A8B8C9]">—</span>
              提醒你在效率之外，还有情绪
            </li>
            <li className="relative pl-6">
              <span className="absolute left-0 text-[#A8B8C9]">—</span>
              提醒你在效率之外，还有身体
            </li>
            <li className="relative pl-6">
              <span className="absolute left-0 text-[#A8B8C9]">—</span>
              提醒你在效率之外，还有美
            </li>
          </ul>

          <p className="text-gray-300/80 leading-relaxed pt-4">
            <span className="text-white/90">音乐，是情绪的容器。</span>
          </p>

          <p className="text-gray-300/80 leading-relaxed">
            Moodify 是我的第一场实验。
            如果它能让你在某个深夜感到一丝被理解，
            那这场实验就已经成功了。
          </p>

          {/* 签名区域 */}
          <div className="pt-12 text-center">
            <div className="inline-block px-8 py-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-white/60 mb-2 italic">
                欢迎登船。
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-white/40">
                <span>Moodify创始人</span>
                <span className="text-white/20">·</span>
                <span>2026年4月</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .prose-custom p {
          margin-bottom: 1.5rem;
        }

        .prose-custom p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </section>
  )
}
