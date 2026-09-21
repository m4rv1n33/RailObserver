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

    // Safari restores the window scroll offset on reload, so a page that was
    // shifted while the keyboard was up comes back shifted. The shell never
    // wants a window scroll at all.
    const previousRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'

    function resetWindowScroll() {
      if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0)
    }

    function focusedField() {
      const active = document.activeElement
      if (!(active instanceof HTMLElement) || !active.matches(FORM_FIELDS)) return null
      return active
    }

    function scrollFocusedIntoView() {
      focusedField()?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }

    function apply() {
      // Pinch-zoom shrinks visualViewport.height too. Scaling it back to
      // layout pixels keeps a zoomed page from locking the shell to a
      // fraction of the screen, which survives a reload because iOS keeps
      // the zoom level.
      const layoutHeight = viewport.height * viewport.scale
      const hidden = window.innerHeight - layoutHeight
      const keyboard = hidden > KEYBOARD_THRESHOLD && focusedField() !== null

      if (keyboard) {
        root.style.setProperty('--app-height', `${layoutHeight}px`)
      } else {
        root.style.removeProperty('--app-height')
      }
      setKeyboardOpen(keyboard)
      if (keyboard) scrollFocusedIntoView()
      else resetWindowScroll()
    }

    let timer: number | undefined
    function onFocusIn(event: FocusEvent) {
      const target = event.target
      if (!(target instanceof HTMLElement) || !target.matches(FORM_FIELDS)) return
      // The keyboard animates in. Scrolling before it has settled centers the
      // field against the old, taller viewport and it ends up covered again.
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        apply()
        scrollFocusedIntoView()
      }, 350)
    }

    function onFocusOut() {
      window.clearTimeout(timer)
      timer = window.setTimeout(apply, 350)
    }

    apply()
    resetWindowScroll()
    viewport.addEventListener('resize', apply)
    viewport.addEventListener('scroll', apply)
    window.addEventListener('orientationchange', apply)
    window.addEventListener('resize', apply)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      window.clearTimeout(timer)
      viewport.removeEventListener('resize', apply)
      viewport.removeEventListener('scroll', apply)
      window.removeEventListener('orientationchange', apply)
      window.removeEventListener('resize', apply)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
      history.scrollRestoration = previousRestoration
      root.style.removeProperty('--app-height')
    }
  }, [])

  return { keyboardOpen }
}
