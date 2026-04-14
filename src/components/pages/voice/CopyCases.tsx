const COPY_CASES = [
  { title: '启动页', text: '"Stay in the flow, stay in the soul."' },
  { title: '情绪选择页', text: '"你今天想待在哪里？"' },
  { title: '关于页', text: '"Moodify 不生产好听的背景音。<br>我们制造情绪的镜像。<br>情绪的潮汐，终将抵达彼岸。"' },
  { title: '退出时的挽留', text: '"好的。<br>随时回来。<br>我在这里。"' },
]

export default function CopyCases() {
  return (
    <section className="py-32 px-6 bg-[#0c0c12]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light tracking-wider text-white mb-4">
            文案案例
          </h2>
          <p className="text-gray-500">
            Moodify 的声音样本
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COPY_CASES.map((case_, i) => (
            <div
              key={i}
              className="case-card bg-[rgba(107,122,143,0.08)] backdrop-blur-lg border border-white/5 rounded-2xl p-6 cursor-pointer hover:border-white/10 transition-all"
              onClick={() => navigator.clipboard.writeText(case_.text.replace(/<br>/g, '\n'))}
            >
              <h4 className="text-sm text-gray-500 uppercase tracking-wider mb-3">
                {case_.title}
              </h4>
              <p
                className="text-lg text-gray-300 font-serif leading-relaxed"
                dangerouslySetInnerHTML={{ __html: case_.text }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
