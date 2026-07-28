import { useRef } from 'react';
import Navigation from './components/Navigation.jsx';
import Section1 from './components/Section1.jsx';

export default function App() {
  const heroRef = useRef(null);
  const contactSectionRef = useRef(null);
  const mainRef = useRef(null);

  return (
    <>
      <Navigation heroRef={heroRef} contactSectionRef={contactSectionRef} mainRef={mainRef} />
      <main ref={mainRef}>
        <Section1 sectionRef={heroRef} />
        {/*
          Placeholder only -- no Contact section design has been built yet.
          This exists purely so the scrollspy has a real "contact" target to
          observe and can be verified end to end; replace with the real
          section when that work happens.
        */}
        <section
          id="contact"
          ref={contactSectionRef}
          className="flex min-h-screen items-center justify-center bg-bg-white"
        >
          <p className="heading-2 text-heading-default">Contact section placeholder</p>
        </section>
      </main>
    </>
  );
}
