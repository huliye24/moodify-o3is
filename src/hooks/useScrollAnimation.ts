import { useEffect, useRef } from 'react'

export default function useScrollAnimation() {
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-8')
      observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [])
}
