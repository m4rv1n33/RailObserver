import { useEffect, useState } from 'react'

export type ColorStyle = 'default' | 'sbb' | 'emerald' | 'sky'

// Accent palettes selectable in the secret menu. `swatch` is the light-mode
// accent, shown as a preview dot. The actual colors live in index.css, keyed by
// the data-theme attribute this hook sets on <html>.
export const COLOR_STYLES: { id: ColorStyle; label: string; swatch: string }[] = [
  { id: 'default', label: 'Classic', swatch: '#4f46e5' },
  { id: 'sbb', label: 'SBB', swatch: '#eb0000' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'sky', label: 'Sky', swatch: '#0284c7' },
]

function stored(): ColorStyle {
  const value = localStorage.getItem('colorStyle')
  return value === 'sbb' || value === 'emerald' || value === 'sky' ? value : 'default'
}

export function useColorStyle() {
  const [style, setStyleState] = useState<ColorStyle>(stored)

  useEffect(() => {
    if (style === 'default') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', style)
  }, [style])

  function setStyle(next: ColorStyle) {
    localStorage.setItem('colorStyle', next)
    setStyleState(next)
  }

  return { style, setStyle }
}
