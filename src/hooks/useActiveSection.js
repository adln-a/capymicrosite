import { useEffect, useState } from 'react';

// Collapses the effective viewport (for intersection purposes only) down to
// a zero-height line at vertical center: -50% off the top and -50% off the
// bottom leaves nothing in between. A section only "intersects" this sliver
// while the viewport's own center line is somewhere inside it, so the
// active link switches exactly when a section crosses viewport-center --
// not the instant its top edge appears, and not tied to a specific pixel
// value that would need retuning if section heights change.
const SCROLLSPY_ROOT_MARGIN = '-50% 0px -50% 0px';

/**
 * Tracks which section currently owns the viewport's center. Lives above
 * Navigation (in App) so Footer's nav can read the same value and highlight
 * in sync, rather than each maintaining its own separate observer/state.
 */
export default function useActiveSection({ heroRef, contactSectionRef }) {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = [
      { key: 'home', ref: heroRef },
      { key: 'contact', ref: contactSectionRef },
    ].filter((section) => section.ref?.current);

    if (sections.length === 0) return undefined;

    const keyByElement = new Map(sections.map((section) => [section.ref.current, section.key]));

    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.find((entry) => entry.isIntersecting);
        if (entered) {
          setActiveSection(keyByElement.get(entered.target));
        }
      },
      { rootMargin: SCROLLSPY_ROOT_MARGIN, threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section.ref.current));
    return () => observer.disconnect();
  }, [heroRef, contactSectionRef]);

  return activeSection;
}
