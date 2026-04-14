import FogLayers from '../shared/FogLayers'
import LogoMark from '../shared/LogoMark'
import BrandTitle from '../shared/BrandTitle'
import Tagline from '../shared/Tagline'
import Slogan from '../shared/Slogan'
import AmbientParticles from '../shared/AmbientParticles'
import TidalSelector from '../shared/TidalSelector'
import ForewordSection from './ForewordSection'

export default function TidalHome() {
  return (
    <div className="tidal-home min-h-screen relative">
      {/* 雾层背景 + 落樱效果 */}
      <FogLayers />

      {/* 环境粒子 */}
      <AmbientParticles />

      {/* 主内容 */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
          <LogoMark />
          <BrandTitle />
          <Tagline />
          <Slogan />
        </section>

        {/* 创始人前言 */}
        <ForewordSection />

        {/* 情绪潮汐选择器 */}
        <section className="py-32 px-6 relative">
          {/* 背景装饰 */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 中心光晕 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gradient-radial from-white/[0.03] via-transparent to-transparent" />

            {/* 装饰线 */}
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>

          <TidalSelector />
        </section>

        {/* 底部留白 */}
        <div className="h-40 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0c0c12]" />
        </div>
      </main>
    </div>
  )
}