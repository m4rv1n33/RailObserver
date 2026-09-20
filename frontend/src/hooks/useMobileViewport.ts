import { useEffect, useState } from 'react'

const FORM_FIELDS = 'input, textarea, select'

// A shrinking viewport of more than this is the on-screen keyboard rather than
// the collapsing browser URL bar.
const KEYBOARD_THRESHOLD = 120

// iOS keeps the layout viewport at full height when the on-screen keyboard
// opens, so a full-height shell never shrinks and the keyboard simply covers
// whatever is focused. visualViewport reports the part that stays visible;
// mirroring it into --app-height makes the shell shrink instead, and the
// focused field can then be scrolled into the visible area.
export function useMobileViewport(): { keyboardOpen: boolean } {
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    if (!window.visualViewport) return

    const viewport = window.visualViewport
    const root = document.documentElement

    function scrollFocusedIntoView() {
      const active = document.activeElement
      if (!(active instanceof HTMLElement) || !active.matches(FORM_FIELDS)) return
      active.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }

    function apply() {
      root.style.setProperty('--app-height', `${viewport.height}px`)
      setKeyboardOpen(window.innerHeight - viewport.height > KEYBOARD_THRESHOLD)
      scrollFocusedIntoView()
    }

    let timer: number | undefined
    function onFocusIn(event: FocusEvent) {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.matches(FORM_FIELDS)) return
      // The keyboard animates in. Scrolling before it has settled centers the
      // field against the old, taller viewport and it ends up covered again.
      window.clearTimeout(timer)
      timer = window.setTimeout(scrollFocusedIntoView, 350)
    }

    apply()
    viewport.addEventListener('resize', apply)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      window.clearTimeout(timer)
      viewport.removeEventListener('resize', apply)
      document.removeEventListener('focusin', onFocusIn)
      root.style.removeProperty('--app-height')
    }
  }, [])

  return { keyboardOpen }
}
