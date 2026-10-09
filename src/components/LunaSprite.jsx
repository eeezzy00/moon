// Спрайт LUNA.AI, 10 кадров 64×64. talking: анимация диалога (luna-talk.png), иначе спокойная (luna.png).
// mood: спрайт эмоции public/luna-<mood>.png (sad, confused, oxygen, joy), если он загружен.
// glow: размытая копия того же кадра под спрайтом, свет идёт от реальных пикселей картинки.
export default function LunaSprite({ scale = 4, talking = false, mood = null, glow = false, className = '' }) {
  const cls = `luna-sprite ${talking ? 'luna-sprite--talk' : ''} ${mood ? `luna-sprite--${mood}` : ''}`
  return (
    <span className={`luna-wrap ${className}`} style={{ '--s': scale }} aria-hidden="true">
      {glow && <span className={`${cls} luna-sprite--glow`} />}
      <span className={cls} />
    </span>
  )
}
