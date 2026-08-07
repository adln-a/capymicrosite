import ScrollSection from './ScrollSection.jsx';
import { NavLink } from './Navigation.jsx';
import footerNavActiveMarker from '../assets/Footer-Nav--Active-Marker.svg';
import illustration from '../assets/Desktop-IMG-Footer.svg';

// Same staggered fade-up convention as every other section (0.15s steps).
// ScrollSection only animates opacity/transform -- never visibility,
// display, or aria-hidden -- so every element below is present and
// reachable in the accessibility tree and tab order from first render,
// regardless of animation state. ScrollSection also skips the animation
// entirely under prefers-reduced-motion (rendering everything at its
// final, fully-visible position instead), so this adds no motion for
// users who've asked not to see any.
const BRAND_DELAY = 0;
const NAV_DELAY = 0.15;
const ILLUSTRATION_DELAY = 0.3;
const COPYRIGHT_DELAY = 0.45;

export default function Footer({ activeSection }) {
  return (
    <footer className="flex w-full flex-col items-start justify-start bg-bg-dark-green px-page-margin-x py-l">
      {/* content-cap: the site-wide desktop content cap -- without it, the
          nav row below (justify-between across 3 links) stretched
          edge-to-edge at wide viewports, spreading "Home", "Contact us",
          and "Download our design guide" far apart with no visual
          relationship between them, same issue every other uncapped
          section had. */}
      <div className="flex w-full flex-col items-start gap-l content-cap">
        {/* gap-xl sm:gap-m: S gets extra breathing room between the
            paragraph and the nav links below it (own request) -- M/L/XL
            keep the original tighter gap-m unchanged. */}
        <div className="flex flex-col items-start justify-start gap-xl self-stretch sm:gap-m">
          {/* Plain paragraph, not a heading -- this is the footer's own
              brand/identity label (like a wordmark), not a heading that
              introduces the content below it, so it's left out of the
              page's heading outline rather than added as a trailing,
              oddly-placed h2/h3 after every real section heading. */}
          <ScrollSection
            transition={{ duration: 0.6, ease: 'easeOut', delay: BRAND_DELAY }}
            className="flex flex-col items-start justify-start gap-s self-stretch"
          >
            <p className="heading-3 self-stretch text-body-inverted">CAPY by 55 Minutes</p>
            <p className="body-paragraph self-stretch text-body-inverted">
              A design exploration to support and uplift children from low-income families in
              Singapore.
            </p>
          </ScrollSection>

          {/* as="nav" (not a motion.div wrapping a plain <nav>) so the
              landmark tag itself -- and the aria-label distinguishing it
              from the header's own "Primary" nav -- survive onto the actual
              animated element, rather than being buried inside a wrapper
              that doesn't carry the semantics. Reuses NavLink's
              active/default logic (same component the header uses) but with
              this footer's own outline-scribble marker asset and white text
              color, since the header's solid-fill marker and dark text are
              tuned for its light background, not this dark green one.

              S: stacked (flex-col, centered) instead of the M+ row --
              without this, "Download our design guide" had nowhere near
              enough room to sit on one line alongside Home/Contact us in
              the original justify-between row, so each link's own text
              wrapped internally into a cramped two-line mess instead of
              cleanly stacking. items-center (not items-start, unlike the
              rest of this footer's left-aligned content) matches the
              main nav's own S-tier full-screen panel, which centers its
              stacked links the same way. sm: reverts to the original
              row, unchanged. */}
          <ScrollSection
            as="nav"
            aria-label="Footer"
            transition={{ duration: 0.6, ease: 'easeOut', delay: NAV_DELAY }}
            className="flex flex-col items-center justify-start gap-xl self-stretch sm:flex-row sm:justify-between sm:gap-0"
          >
            <NavLink
              href="#section-1"
              label="Home"
              isActive={activeSection === 'home'}
              activeMarkerSrc={footerNavActiveMarker}
              activeColorClassName="text-body-inverted hover:text-capy-orange-100"
              defaultColorClassName="text-body-inverted hover:text-capy-orange-100"
            />
            <NavLink
              href="#contact"
              label="Contact us"
              isActive={activeSection === 'contact'}
              activeMarkerSrc={footerNavActiveMarker}
              activeColorClassName="text-body-inverted hover:text-capy-orange-100"
              defaultColorClassName="text-body-inverted hover:text-capy-orange-100"
            />
            <NavLink
              href="#section-17"
              label="Download our design guide"
              isActive={false}
              defaultColorClassName="text-body-inverted hover:text-capy-orange-100"
            />
          </ScrollSection>
        </div>

        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: ILLUSTRATION_DELAY }}
          className="flex flex-col items-center justify-start gap-xs self-stretch"
        >
          <img
            src={illustration}
            alt=""
            aria-hidden="true"
            style={{ width: '598px', height: '255px' }}
            className="max-w-full"
          />
        </ScrollSection>

        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: COPYRIGHT_DELAY }}
          className="flex flex-col items-start justify-start"
        >
          <p className="body-paragraph text-body-inverted">
            Capy is a non-commercial project. All content © 55 Minutes.
          </p>
          <p className="body-paragraph text-body-inverted">
            We respect your privacy and do not collect data beyond submitted forms.
          </p>
        </ScrollSection>
      </div>
    </footer>
  );
}
