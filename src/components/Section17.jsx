import ScrollSection from './ScrollSection.jsx';
import { DownloadButton } from './Navigation.jsx';
import coverImage from '../assets/Capy-PDF-Cover-640w.png';
import coverImage2x from '../assets/Capy-PDF-Cover-1280w.png';

const TEXT_COLUMN_DELAY = 0.18;

export default function Section17() {
  return (
    <section
      id="section-17"
      className="relative flex w-full items-center justify-center bg-bg-linen-light px-page-margin-x py-page-margin-y"
    >
      {/* content-cap: the site-wide desktop content cap. Applied strictly
          here (unlike most sections, this one actually binds): image(640)
          + gap-2xl(64 at xl) + text column's own old 560px cap totaled
          1264px, 124px over policy -- so the text column's max-w-[560px]
          is removed (not just gated) rather than left in place, since
          it's now fully redundant: flex-1 already shrinks it to whatever's
          left after the image+gap within this 1140px wrapper (~436px at
          xl), and outside xl the image+gap alone already ate enough space
          that 560px was never reached anyway (needed a ~1328px viewport
          to matter, well past xl). */}
      {/* Stacked (flex-col, items-stretch so both the image and text
          column reach 100% width) below sm -- side by side (flex-row,
          items-center for vertical centering) from sm up, unchanged. */}
      <div className="flex w-full flex-col items-stretch justify-center gap-2xl content-cap sm:flex-row sm:items-center">
        {/* srcSet (not the 2714x2291 source PNG directly): the source is a
            5.5MB photo-realistic mockup, far bigger than this ever needs to
            render at -- 640w covers the design's own 1x size, 1280w covers
            2x/retina, cutting what a standard-density screen actually
            downloads from 5.5MB to ~430KB. Kept as PNG (not converted to a
            smaller-still format like WebP) because the source has a soft
            alpha-transparent drop shadow around the book mockup; no
            image-optimization tooling (sharp/imagemagick/cwebp) was
            available locally to also re-encode it as WebP. */}
        {/* sm:flex-1 xl:flex-none: at M and L, this makes the image an
            equal flex partner with the text column below (both flex-1,
            basis 0% -- the standard way to split a flex row 50/50 that
            correctly accounts for the gap-2xl between them, unlike
            literal w-1/2 on both, which would overflow by the gap's own
            width). flex-basis:0% governs the main-axis size ahead of the
            inline width:640px below, so that fixed width is effectively
            ignored at M/L. sm:min-w-0 is required alongside it -- flex
            items default to min-width:auto, which for a replaced element
            like this img resolves against its OWN specified/intrinsic
            size (640px here), silently overriding flex-shrink and
            refusing to shrink past that regardless of flex-basis:0% (the
            image measured ~640px at every M width without this, not an
            actual 50/50 split -- same fix Section 6/8's own flex columns
            needed for the identical reason). xl:flex-none reverts to the
            original XL-only behavior, where the image's own 640px width
            governs again (flex:none disables shrink entirely, so
            min-width:0 staying in effect there is harmless -- it only
            ever mattered while shrink was active) and the text column
            (already unconditionally flex-1) absorbs whatever's left --
            unchanged from before. */}
        <ScrollSection
          as="img"
          src={coverImage}
          srcSet={`${coverImage} 640w, ${coverImage2x} 1280w`}
          sizes="640px"
          alt="Cover of the &ldquo;Designing for Low-Income Families in Singapore&rdquo; guide"
          style={{ width: '640px', height: 'auto' }}
          className="max-w-full sm:min-w-0 sm:flex-1 xl:flex-none"
        />

        <ScrollSection
          transition={{ duration: 0.6, ease: 'easeOut', delay: TEXT_COLUMN_DELAY }}
          className="flex flex-1 flex-col items-start justify-start gap-m"
        >
          <p className="body-paragraph self-stretch text-body-default">Download our design guide</p>
          <h2 className="heading-2 self-stretch text-heading-default">
            Designing for Low-Income Families in Singapore
          </h2>
          <div className="flex flex-col items-start justify-start gap-s self-stretch">
            <p className="body-paragraph self-stretch text-body-default">
              We&rsquo;ve put together practical tips, insights, and lessons from the ground – what
              worked, what didn&rsquo;t, and what to watch out for.
            </p>
            <p className="body-paragraph self-stretch text-body-default">
              Whether you&rsquo;re prototyping, testing, or just getting started, this guide can help
              you design with care.
            </p>
          </div>
          <DownloadButton />
        </ScrollSection>
      </div>
    </section>
  );
}
