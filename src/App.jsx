import { useRef } from 'react';
import Navigation from './components/Navigation.jsx';
import Section1 from './components/Section1.jsx';
import Section2 from './components/Section2.jsx';
import Section3 from './components/Section3.jsx';
import Section5 from './components/Section5.jsx';

export default function App() {
  const heroRef = useRef(null);
  const sentinelRef = useRef(null);
  const contactSectionRef = useRef(null);
  const mainRef = useRef(null);

  return (
    <>
      <Navigation
        heroRef={heroRef}
        sentinelRef={sentinelRef}
        contactSectionRef={contactSectionRef}
        mainRef={mainRef}
      />
      <main ref={mainRef}>
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
        {/* Placeholder only -- no Section 4 design has been built yet.
            Keeps page flow/scroll order intact for the sections built
            after it. */}
        <section id="section-4" className="flex h-dvh items-center justify-center bg-bg-white">
          <h2 className="heading-2 text-heading-default">Section 4 — TBD</h2>
        </section>
        <Section5 />
        {/*
          Placeholder only -- no Contact section design has been built yet.
          min-h-[150vh] (not min-h-screen) is deliberate: at exactly one
          viewport tall, the real page's max scroll position only brings
          Section 1's bottom edge to *exactly* touch the viewport top --
          a zero-overlap boundary that browsers still count as
          intersecting, so the nav never actually collapses to the toggle
          during real scrolling. The extra height gives real, unambiguous
          room to scroll Section 1 clearly out of view. Replace with the
          real Contact section design when that work happens.
        */}
        <section
          id="contact"
          ref={contactSectionRef}
          className="flex min-h-[150vh] items-center justify-center bg-bg-white"
        >
          <h2 className="heading-2 text-heading-default">Contact section placeholder</h2>
        </section>
      </main>
    </>
  );
}
