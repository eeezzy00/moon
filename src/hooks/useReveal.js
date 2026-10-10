import { useEffect } from 'react'

// Списки, элементы которых появляются «лесенкой» внутри блока
const LISTS = '.grid, .gal, .gp, .how__steps, .phases, .flow, .faq, .contracts, .gloss, .scenes, .doc-sec ul'

// Плавное появление блоков при прокрутке: .reveal, затем .in, когда блок виден.
// Дочерним элементам выставляется --i, элементам списков --j: по ним CSS делает задержки.
export function useReveal(selector = '.section, .doc-sec, .cta, .docs__head') {
  useEffect(() => {
    let io
    let mo
    const root = document.documentElement
    const els = [...document.querySelectorAll(selector)]
    els.forEach((el) => {
      ;[...el.children].forEach((c, i) => c.style.setProperty('--i', i))
      el.querySelectorAll(LISTS).forEach((list) => {
        ;[...list.children].forEach((c, j) => c.style.setProperty('--j', j))
      })
    })
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('reveal', 'in'))
      return
    }
    // секции прячутся сразу (иначе при проявлении страницы их содержимое мигнуло бы)...
    els.forEach((el) => el.classList.add('reveal'))
    // ...а «показанными» считаются только после загрузки и вступления
    const start = () => {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
        }),
        { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
      )
      els.forEach((el) => io.observe(el))
    }
    const busy = () => root.classList.contains('is-loading') || root.classList.contains('intro')
    if (busy()) {
      mo = new MutationObserver(() => { if (!busy()) { mo.disconnect(); start() } })
      mo.observe(root, { attributes: true, attributeFilter: ['class'] })
    } else start()
    return () => { io?.disconnect(); mo?.disconnect() }
  }, [selector])
}
