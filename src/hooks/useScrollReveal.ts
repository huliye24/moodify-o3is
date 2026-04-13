import { useEffect, useRef } from 'react'

/**
 * Intersection Observer 驱动滚动入场动画
 * 给 .scroll-section 元素自动添加 is-visible 类
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
        ...options,
      }
    )

    // 观察所有 scroll-section 元素
    const sections = container.querySelectorAll('.scroll-section')
    sections.forEach((s) => observer.observe(s))

    // 也观察未来可能动态添加的元素
    const mutationObserver = new MutationObserver(() => {
      const newSections = container.querySelectorAll('.scroll-section:not(.is-visible)')
      newSections.forEach((s) => observer.observe(s))
    })

    mutationObserver.observe(container, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return containerRef
}

/**
 * 标签动画：入场时自动触发 stagger 延迟
 */
export function useStaggeredReveal(childClass = '.stagger-child') {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = entry.target.querySelectorAll(childClass)
            children.forEach((child, i) => {
              ;(child as HTMLElement).style.transitionDelay = `${i * 0.08}s`
              child.classList.add('is-visible')
            })
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [childClass])

  return containerRef
}
