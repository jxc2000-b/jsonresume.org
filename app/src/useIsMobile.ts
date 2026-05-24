import { useEffect, useState } from 'react';

/**
 * Viewport-based mobile detection. Drives the App.tsx dispatch between
 * DesktopApp and MobileApp. 768px matches Tailwind's `md` breakpoint —
 * phones land on mobile, tablets and up on desktop.
 *
 * Listens via `matchMedia`, not a resize handler, so there's one event
 * per breakpoint crossing instead of dozens per drag. SSR-safe default
 * is `false` (desktop).
 */

const MOBILE_QUERY = '(max-width: 767px)';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    // Sync once in case initial SSR value drifted from the real viewport.
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
