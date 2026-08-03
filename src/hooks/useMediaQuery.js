import { useEffect, useState } from 'react';

// Generic matchMedia-backed hook: returns whether `query` currently matches,
// staying in sync as the viewport crosses it in either direction (window
// resize, device rotation, etc.) via a MediaQueryList 'change' listener
// rather than a 'resize' listener, so this only fires right at the
// breakpoint crossing instead of on every pixel of drag. Function
// initializer on useState so the very first render (before any effect
// runs) already reflects the real viewport instead of defaulting to one
// value and visibly flipping right after mount. `typeof window` guard is
// the usual SSR/no-DOM safety net, even though this app is client-rendered.
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
