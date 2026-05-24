import DesktopApp from './DesktopApp';
import MobileApp from './MobileApp';
import { useIsMobile } from './useIsMobile';

/**
 * Viewport-based dispatcher. Below 768px we render `MobileApp` (pill +
 * scroll-snap, matches the reference screenshot); at 768px and above
 * we render `DesktopApp` (toolbar + thumbnail rail + main viewport).
 *
 * Crossing the breakpoint remounts the chosen subtree — paginators
 * re-measure from scratch, and surface-local state (zoom, current
 * page) resets. That's deliberate: the user is on one surface at a
 * time, and sharing state across very different chromes adds coupling
 * without UX benefit.
 */
export default function App() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileApp /> : <DesktopApp />;
}
