import MoodSelector from '../components/MoodSelector'

export default function MoodPage() {
  return (
    <div
      className="h-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d18 100%)' }}
    >
      <MoodSelector />
    </div>
  )
}
