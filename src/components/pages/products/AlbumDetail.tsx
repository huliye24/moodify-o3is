interface AlbumDetailProps {
  mood: string
  title: string
  subtitle: string
  color: string
  meta: { label: string; value: string }[]
  tracks: { range: string; desc: string }[]
  scenes: string[]
}

export default function AlbumDetail({
  mood,
  title,
  subtitle,
  color,
  meta,
  tracks,
  scenes,
}: AlbumDetailProps) {
  return (
    <div
      id={`album-${mood}`}
      className="album-detail grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
    >
      {/* Visual */}
      <div className="album-visual flex justify-center">
        <div
          className="album-cover w-64 h-64 md:w-80 md:h-80 rounded-2xl relative overflow-hidden shadow-2xl"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noiseFilter%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noiseFilter)%27/%3E%3C/svg%3E')] opacity-10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-light text-white/20">{title.charAt(0)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="album-content">
        <span className="text-sm text-gray-500 tracking-wider mb-2 block">
          专辑 {meta[0]?.value}
        </span>
        <h2 className="text-4xl font-light text-white mb-2 tracking-wider">
          {title}
        </h2>
        <p className="text-gray-500 italic mb-6">{subtitle}</p>

        {/* Meta info */}
        <div className="flex gap-6 mb-8">
          {meta.map((item, i) => (
            <div key={i}>
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                {item.label}
              </div>
              <div className="text-gray-300">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Track structure */}
        <div className="mb-8">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-4">
            音乐结构
          </h3>
          <div className="space-y-3">
            {tracks.map((track, i) => (
              <div key={i} className="flex gap-4 text-sm">
                <span className="text-gray-600 font-mono min-w-[100px]">
                  {track.range}
                </span>
                <span className="text-gray-400">{track.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scene tags */}
        <div>
          <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-4">
            使用场景
          </h3>
          <div className="flex flex-wrap gap-2">
            {scenes.map((scene, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm rounded-full border border-white/10 text-gray-400"
                style={{ borderColor: `${color}30` }}
              >
                {scene}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
