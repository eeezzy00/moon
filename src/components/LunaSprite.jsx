// Спрайт LUNA.AI, 10 кадров 64×64. talking: анимация диалога (luna-talk.png), иначе спокойная (luna.png).
// glow: размытая копия того же кадра под спрайтом, свет идёт от реальных пикселей картинки.
export default function LunaSprite({ scale = 4, talking = false, glow = false, className = '' }) {
  const cls = `luna-sprite ${talking ? 'luna-sprite--talk' : ''}`
  return (
    <span className={`luna-wrap ${className}`} style={{ '--s': scale }} aria-hidden="true">
      {glow && <span className={`${cls} luna-sprite--glow`} />}
      <span className={cls} />
    </span>
  )
}
