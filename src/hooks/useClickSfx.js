import { useEffect } from 'react'
import { playCoin } from '../lib/sfx'

// Кнопки и элементы-кнопки, которые звенят «монеткой» при клике
const CLICKABLE = 'button, .btn, summary'

export function useClickSfx() {
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest?.(CLICKABLE)
      if (el && !el.disabled) playCoin()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
}
