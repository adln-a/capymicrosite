import ScrollSection from './ScrollSection.jsx';
import { DownloadButton } from './Navigation.jsx';
import coverImage from '../assets/Capy-PDF-Cover-640w.png';
import coverImage2x from '../assets/Capy-PDF-Cover-1280w.png';

const TEXT_COLUMN_DELAY = 0.18;

export default function Section17() {
  return (
    <section
      id="section-17"
      className="flex h-dvh w-full items-center justify-center gap-2xl bg-bg-linen-light px-page-margin-x"
    >
      {/* srcSet (not the 2714x2291 source PNG directly): the source is a
          5.5MB photo-realistic mockup, far bigger than this ever needs to
          render at -- 640w covers the design's own 1x size, 1280w covers
          2x/retina, cutting what a standard-density screen actually
          downloads from 5.5MB to ~430KB. Kept as PNG (not converted to a
          smaller-still format like WebP) because the source has a soft
          alpha-transparent drop shadow around the book mockup; no
          image-optimization tooling (sharp/imagemagick/cwebp) was
          available locally to also re-encode it as WebP. */}
      <ScrollSection
        as="img"
        src={coverImage}
        srcSet={`${coverImage} 640w, ${coverImage2x} 1280w`}
        sizes="640px"
        alt="Cover of the &ldquo;Designing for Low-Income Families in Singapore&rdquo; guide"
        style={{ width: '640px', height: 'auto' }}
        className="max-w-full"
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
    </section>
  );
}
