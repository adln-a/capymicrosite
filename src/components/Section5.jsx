import ScrollSection from './ScrollSection.jsx';
import AccessibleHighlightText from './AccessibleHighlightText.jsx';
import paperTearBg from '../assets/Paper-Tear-BG.png';
import blueDottedUnderline from '../assets/Blue-Dotted-Underline.svg';
import illustrationXl from '../assets/Desktop-IMG-Frame-5.svg';
import illustrationS from '../assets/s/S--IMG-Frame5.svg';

function AffordableHighlight({ children }) {
  // Same span-wrap technique as the other scribble/underline highlights
  // (FourHighlight in Section 1, RealProblemHighlight in Section 11):
  // z-0 on the wrapping span gives it its own stacking context so the
  // image's -z-10 stays scoped inside it. Blue-Dotted-Underline.svg sits
  // flush against the text's own bottom edge (bottom-0) rather than
  // using the shared --scribble-offset-* pull-up tokens, which were
  // tuned for taller marks that need to tuck up into the glyph's
  // descender space.
  //
  // width: 100% (not the image's own native 197px) -- heading-2-accent's
  // font-size shrinks at S/M (own --type-h2-font-size breakpoints), so
  // "affordable" itself renders much narrower there too; a fixed native
  // width stayed 197px regardless, badly overrunning past the word and
  // into "enrichment" on mobile. The wrapping span is inline-block, so
  // it already hugs "affordable"'s own current rendered width exactly --
  // sizing the image to 100% of THAT (rather than a fixed px value)
  // keeps the underline matched to the word at every breakpoint with no
  // per-tier tuning, the same fix needed if this ever badly overruns
  // again at some other tier this wasn't tested against.
  return (
    <span className="relative z-0 inline-block whitespace-nowrap">
      <img
        src={blueDottedUnderline}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 w-full h-auto max-w-none -translate-x-1/2"
      />
      <span className="heading-2-accent relative">{children}</span>
    </span>
  );
}

function RuledLines() {
  // 7 evenly-spaced notebook-ruling lines behind the heading/holes -- z-0
  // alone does NOT actually put this behind its later siblings: this div
  // is position:absolute, and absolutely-positioned elements always paint
  // AFTER non-positioned in-flow content within the same stacking context
  // regardless of DOM order (the bug that hit HoleColumn above -- see its
  // own relative z-10 fix, needed because it was NOT positioned at all).
  // The text wrapper further below stays correctly on top too, but for a
  // different reason: it's already `relative` with no explicit z-index,
  // so it shares this div's own "z-index 0" stacking bucket -- and within
  // that shared bucket, plain DOM order decides (it comes after RuledLines
  // in the markup), no extra z-10 needed there.
  //
  // opacity-50, unconditional at every breakpoint (was sm:opacity-50,
  // matching the S reference export's own full-opacity lines) -- this
  // box's bg-bg-red is now capy-orange-a11y (after the bg-red/orange
  // merge), and the border-pomegranate-500 lines read too loud against it
  // at full strength regardless of size, same fix as Section 14's own
  // RuledLines.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[38px] z-0 flex flex-col gap-[32px] opacity-50"
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-0 self-stretch border-t border-pomegranate-500" />
      ))}
    </div>
  );
}

function HoleColumn() {
  // Top hole, middle pair (gap-s), bottom hole -- height-[220px] with
  // justify-between spaces the three groups out to the card's full height,
  // same idea as Section 2's HoleColumn but with this specific
  // top/pair/bottom split (matches Section 1's punch-hole pattern more
  // than Section 2's plain even stack).
  //
  // relative z-10: without it, RuledLines (a DOM-order sibling, rendered
  // right before this) painted on TOP of these holes -- position:absolute
  // elements (RuledLines is one) always paint after non-positioned in-flow
  // content within the same stacking context, DOM order notwithstanding
  // (same rule that bit Section 14's ruled lines vs. its own text).
  return (
    <div aria-hidden="true" className="relative z-10 flex h-[220px] flex-col items-start justify-between">
      <span className="h-5 w-5 rounded-full bg-bg-pink" />
      <div className="flex flex-col items-start gap-s">
        <span className="h-5 w-5 rounded-full bg-bg-pink" />
        <span className="h-5 w-5 rounded-full bg-bg-pink" />
      </div>
      <span className="h-5 w-5 rounded-full bg-bg-pink" />
    </div>
  );
}

export default function Section5() {
  return (
    <section
      id="section-5"
      className="relative flex w-full items-center justify-center bg-bg-pink px-page-margin-x py-page-margin-y sm:min-h-dvh"
    >
      {/* Outer content width: full width below sm -- both the card and the
          illustration fill 100% of the available viewport width on mobile
          (not the S reference's own literal 361/360px frames), simply
          centered within this now-wider wrapper via items-center. Stays
          at w-full from sm to lg too (M tier), now capped at max-w-680px
          -- the illustration inside is itself w-full (see its own
          comment below), so this cap is what actually gives M's
          "illustration at 100% width, max 680px" its ceiling; the
          560px-wide card (narrower than the illustration at every M
          width) just centers within whatever width this wrapper actually
          resolves to. lg:max-w-none cancels that cap again for L/XL,
          where the wrapper reverts to the original fixed 800px it always
          had (matching the L reference's own outer frame, which wraps a
          640px card and a 720px illustration within it, same as M, just
          with that extra shared frame added around both).

          sm:min-h-dvh (not unconditional min-h-dvh, and not h-dvh): below
          sm, this section's content can run taller than one viewport at
          narrow widths (the heading wraps more, and the illustration +
          card both stack at full width) -- a fixed height at every size
          would clip that instead of letting the section hug its own
          content, same fix as Section 3. min- (not a hard h-dvh cap) so
          that above sm, content that needs more than one viewport's worth
          of height at high zoom/reflow still grows the section instead of
          clipping, rather than assuming the M/L/XL layouts always fit
          exactly one screen. py-page-margin-y (64px at S, growing at
          wider tiers) gives it breathing room in that hugged state.

          justify-start (base) + self-stretch is a real bug at M: self-
          stretch makes this wrapper fill the section's ENTIRE cross-space
          (not just its own content height), so the section's
          own items-center has nothing left to center -- it's already
          looking at a full-height child. justify-start then packs this
          wrapper's own children (the card group + illustration) against
          its top edge, so the actual visible content sits pinned under
          the top padding with all the leftover vertical space silently
          collected below it, not evenly split top/bottom -- the exact
          opposite of "vertically centered". sm:justify-center fixes that
          for M specifically (640-991px) by centering the children WITHIN
          this now-full-height wrapper instead. lg:justify-start reverts
          to the original packed-to-top behavior from L up, unchanged. */}
      <div className="flex w-full flex-col items-center justify-start self-stretch sm:max-w-[680px] sm:justify-center lg:w-[800px] lg:max-w-none lg:justify-start">
        {/* Card group: plain, unanimated position:relative wrapper -- the
            paper-tear background and tape are absolutely positioned
            children of THIS group (not the red box), so they render
            statically alongside the box regardless of the box's own
            fade-in-up, which is scoped to the ScrollSection below instead
            of this whole group. */}
        <div className="relative flex flex-col items-start justify-start">
          {/* Torn-paper background: absent below sm entirely (hidden, not
              just invisible) -- the S reference has no equivalent image
              at all behind the card, only M and L do. Sized/positioned
              proportionally to the card's own current width (this img's
              nearest positioned ancestor is the group div directly above,
              which shrink-wraps to the card's width) rather than one flat
              pixel size for the whole sm+ range: the original 621x248/
              left:-57px was tuned against the shared M/L 640px card, so
              at M's new narrower 560px card (560/640 = 0.875 scale) it's
              scaled down to 543x217/-49.88px to keep the same
              proportional overhang, then explicitly reverts to the
              original untouched 621x248/-57px from lg up, matching the
              still-640px L card exactly as before. top stays flat --
              it's a vertical anchor to the group's own top-left corner,
              not width-dependent. */}
          <img
            src={paperTearBg}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute hidden top-[37px] origin-top-left rotate-[-2deg] sm:block sm:w-[543px] sm:h-[217px] sm:left-[-49.88px] lg:w-[621px] lg:h-[248px] lg:left-[-57px]"
          />

          {/* w-full below sm (card fills the full viewport width on
              mobile), 560px for M specifically (640-991px -- see
              BREAKPOINTS.md, sm is where M starts), reverting to 640px
              from lg up (matching the L reference, identical to the old
              M/L-shared value) through L, 800px from xl up -- the true
              desktop width (matching the original, pre-responsive
              design). There was no separate XL reference for this
              section, but 640px was only ever confirmed for M/L
              specifically, not "desktop" -- restoring 800px at xl instead
              of assuming L's value carries forward indefinitely.
              Padding/gap/radius corrected to match all three references
              exactly (16/24px padding, 24px gap, 16px radius flat -- not
              rounded-medium's own growing 16->20->24, which this card
              deliberately doesn't use). */}
          <ScrollSection className="relative flex w-full flex-row items-center justify-center gap-l rounded-small bg-bg-red px-s py-l sm:w-[560px] lg:w-[640px] xl:w-[800px]">
            <RuledLines />
            <HoleColumn />

            <div className="relative flex flex-1 flex-wrap content-center items-center justify-start gap-xs px-s">
              <div className="flex flex-1 items-center justify-center">
                <h2 className="heading-2 text-heading-inverted">
                  <AccessibleHighlightText
                    before="How might we help low-income parents access "
                    highlight={<AffordableHighlight>affordable</AffordableHighlight>}
                    after=" enrichment opportunities for their children despite financial constraints and competing essential needs?"
                  />
                </h2>
              </div>
            </div>
          </ScrollSection>

          {/* Tape: genuinely different size at S (200x40) vs M/L/XL
              (240x48), rotate(7deg) at every reference (was rotate-6/6deg,
              a pre-existing mismatch corrected here alongside the
              responsive work). Horizontally centered via left-1/2 +
              -translate-x-1/2 (the tape's own width, so it self-adjusts
              at any size) rather than the breakpoint-specific left
              offsets the S/M/L references themselves used (84px/203px/
              204px) -- those were only ever each individually tuned
              against ONE specific card width; centering directly is what
              actually keeps it centered on the card now that the card's
              own width changes across breakpoints (100%/640px/800px),
              instead of needing a new hardcoded value every time the
              card width does. top stays a flat -36px (was -35px, a
              similar small correction) since vertical position doesn't
              depend on the card's width. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[-36px] h-[40px] w-[200px] origin-top-left -translate-x-1/2 rotate-[7deg] bg-bg-light-blue mix-blend-multiply sm:h-[48px] sm:w-[240px]"
          />
        </div>

        {/* <picture> swaps to the dedicated S export below sm (360px wide,
            no separate M/L export was given, so the existing desktop
            asset -- already close to L's own 720px target -- just
            carries through unchanged from sm up, same "reuse the nearest
            larger tier" pattern as Section 1/2/3's backgrounds).
            block w-full: <picture> has no default box behavior of its
            own (browsers treat it as an unstyled inline-level wrapper) --
            without an explicit block+width, its own box shrinks to the
            image's intrinsic size instead of stretching to fill this
            column, which silently broke the img's own w-full below (a
            percentage width resolves against ITS immediate parent, i.e.
            this <picture>, not the column further out). Same fix as
            Section 2's own <picture> wrappers. */}
        <picture className="block w-full">
          <source media="(min-width: 640px)" srcSet={illustrationXl} />
          <ScrollSection
            as="img"
            src={illustrationS}
            alt=""
            aria-hidden="true"
            // -16px pulls the illustration up so its top edge overlaps the
            // box's bottom edge by exactly 16px, rather than sitting flush
            // against it (the default with no gap set on the flex-col
            // wrapper above).
            style={{ marginTop: '-16px' }}
            // relative (not just static default) matters here: the red box
            // is position:relative (needed for its own absolute children),
            // and positioned elements always paint after plain static
            // content within the same stacking context, regardless of DOM
            // order. Without this, the box painted on top of the
            // illustration even though it comes first in the markup.
            //
            // w-full below sm (was a fixed w-[360px] max-w-full, which
            // only reached 100% by coincidence on the narrowest phones
            // where max-w-full happened to clamp it down -- at any wider
            // S viewport, e.g. 600px, it stayed fixed at 360px instead of
            // filling the available ~568px), matching the card's own
            // w-full treatment above. Stays w-full through M too now (was
            // a flat sm:w-[718px] covering M AND L/XL alike) -- the outer
            // wrapper's own new sm:max-w-[680px] (see its comment) is what
            // actually caps this at M, so 100% here means "fill up to
            // 680px, shrink below that on narrower M viewports" rather
            // than a fixed number. lg:w-[718px] explicitly restores the
            // exact original flat value from L up, unchanged.
            className="relative h-auto w-full lg:w-[718px]"
          />
        </picture>
      </div>
    </section>
  );
}
