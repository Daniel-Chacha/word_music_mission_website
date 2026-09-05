import { THEME_STORAGE_KEY } from '@/lib/theme'

/**
 * Applies the stored theme before first paint.
 *
 * This has to be a blocking inline script: doing it in an effect would paint
 * the dark theme first and then snap to light, which is worse than having no
 * toggle at all. It renders as the first node in <body>, so it executes before
 * the rest of the document is parsed.
 *
 * The server renders data-theme="dark", so this only ever rewrites the
 * attribute for someone who has chosen light.
 */
const SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}
