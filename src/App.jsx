import { useRef } from 'react';
import useActiveSection from './hooks/useActiveSection.js';
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import Section1 from './components/Section1.jsx';
import Section2 from './components/Section2.jsx';
import Section3 from './components/Section3.jsx';
import Section4 from './components/Section4.jsx';
import Section5 from './components/Section5.jsx';
import Section6 from './components/Section6.jsx';
import Section7 from './components/Section7.jsx';
import Section8 from './components/Section8.jsx';
import Section9 from './components/Section9.jsx';
import Section10 from './components/Section10.jsx';
import Section11 from './components/Section11.jsx';
import Section12 from './components/Section12.jsx';
import Section13 from './components/Section13.jsx';
import Section14 from './components/Section14.jsx';
import Section15 from './components/Section15.jsx';
import Section16 from './components/Section16.jsx';
import Section17 from './components/Section17.jsx';
import Section18 from './components/Section18.jsx';

export default function App() {
  const heroRef = useRef(null);
  const sentinelRef = useRef(null);
  const contactSectionRef = useRef(null);
  const mainRef = useRef(null);
  const activeSection = useActiveSection({ heroRef, contactSectionRef });

  return (
    <>
      {/* First focusable element on the page, before the primary nav --
          standard "visually hidden until focused" skip link. Targets
          #main-content, which carries tabIndex={-1} so activating this
          (click or Enter) actually MOVES focus there too, not just
          scrolls -- a plain <main> with no tabindex is scroll-only.
          focus:outline-none on <main> below suppresses the global teal
          :focus-visible ring there specifically, since ringing the
          entire page-content box on landing isn't useful feedback (the
          scroll jump + focus move already are). */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-s focus:top-s focus:z-50 focus:rounded-medium focus:bg-button-primary-orange focus:px-m focus:py-s focus:text-button-inverted focus:shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
      >
        Skip to content
      </a>
      <Navigation sentinelRef={sentinelRef} mainRef={mainRef} activeSection={activeSection} />
      <main ref={mainRef} id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* Nav-collapse sentinel: zero visual presence, exists purely for
            Navigation's IntersectionObserver to watch. Rendered as the true
            first element on the page (before Section 1's own padding takes
            effect) so it sits right at the top of the page/nav area -- the
            instant it scrolls out of the viewport, Navigation swaps to the
            hamburger toggle. */}
        <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
        <Section1 sectionRef={heroRef} />
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 />
        <Section6 />
        <Section7 />
        <Section8 />
        <Section9 />
        <Section10 />
        <Section11 />
        <Section12 />
        <Section13 />
        <Section14 />
        <Section15 />
        <Section16 />
        <Section17 />
        <Section18 sectionRef={contactSectionRef} />
      </main>
      <Footer activeSection={activeSection} />
    </>
  );
}
