import { CONFIG } from './config'

// 0 = новолуние ... 4 = полнолуние
export const phaseIndex = (gram) => Math.min(4, Math.floor(gram / CONFIG.phaseStep))
export const percent = (gram) => Math.round((gram / CONFIG.maxGram) * 100)
export const gramLeft = (gram) => Math.max(0, CONFIG.maxGram - gram)
// Доля освещённого диска для каждой фазы
export const PHASE_LIT = [0, 0.25, 0.5, 0.75, 1]
