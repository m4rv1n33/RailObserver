import { useEffect, useState } from 'react'

// Toggles the secret "SBB style" theme: a data-theme="sbb" attribute on <html>
// that re-maps the whole palette (see index.css). The choice is persisted and
// applied before first paint by the inline script in index.html.
export function useSbbStyle() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('colorStyle') === 'sbb')

  useEffect(() => {
    if (enabled) document.documentElement.setAttribute('data-theme', 'sbb')
    else document.documentElement.removeAttribute('data-theme')
    localStorage.setItem('colorStyle', enabled ? 'sbb' : 'default')
  }, [enabled])

  return { enabled, toggle: () => setEnabled((value) => !value) }
}
