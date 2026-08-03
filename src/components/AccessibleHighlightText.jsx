/**
 * Renders a heading run that mixes plain sentence text with a decorative
 * Highlight component (nested spans + an absolutely-positioned scribble/
 * tape image), paired with the single flat sr-only string VoiceOver
 * actually reads.
 *
 * WHY THIS EXISTS: a Highlight component's nested spans + absolutely-
 * positioned image read to VoiceOver as separate nested "items" inside the
 * heading, each announced at its own DOM depth ("level 1") -- confusing
 * noise despite the image itself already being aria-hidden. Wrapping the
 * whole visual run in aria-hidden and providing one flat sr-only string
 * skips all of that.
 *
 * This pairing used to be hand-duplicated at each call site -- the same
 * sentence typed out twice, once as JSX with the Highlight embedded and
 * once as a flat sr-only string -- which let them silently drift out of
 * sync (Section 5's sr-only string said "AFFORDABLE enrichment" long after
 * the visual copy had moved on to only highlighting "enrichment"). `before`/
 * `after` are the single source of truth for the surrounding sentence,
 * reused for BOTH the visual and sr-only renders. The highlighted word
 * itself is read straight off `highlight.props.children` -- every Highlight
 * component (FourHighlight, PeopleHighlight, ScribbleHighlight, etc.) takes
 * its word as `children` rather than hardcoding it internally, so the word
 * is only ever typed once, at the call site (e.g. `<FourHighlight>FOUR
 * </FourHighlight>`), instead of also being repeated as a separate
 * `highlightText` prop.
 *
 * `visualClassName` is only for layouts like Section 16's, which need the
 * visual run's own flex-wrap/gap styling -- when given, `before`/`after`
 * are trimmed for the VISUAL spans only (the gap supplies the spacing
 * gap-xs already handles), while the sr-only string keeps its own
 * space-separated `before`/`after` untouched, since flat text needs an
 * explicit space where a flex gap doesn't.
 *
 * IMPORTANT: the sr-only text is built as ONE concatenated string
 * (`before + highlightText + after`), not three separate `{before}
 * {highlightText}{after}` expressions. Each `{}` in JSX becomes its own
 * text node, even when every value is a plain string -- so three
 * expressions sitting side by side produced three sibling text nodes,
 * which VoiceOver read as a "2 items"/"level 1" compound object, the exact
 * bug this component exists to avoid, just relocated into the sr-only
 * span instead of the visible one. Concatenating first collapses it back
 * down to the single text node VoiceOver needs to read the heading as one
 * plain string.
 */
export default function AccessibleHighlightText({ before = '', highlight, after = '', visualClassName }) {
  const visualBefore = visualClassName ? before.trim() : before;
  const visualAfter = visualClassName ? after.trim() : after;
  const srOnlyText = before + highlight.props.children + after;

  return (
    <>
      <span aria-hidden="true" className={visualClassName}>
        {visualBefore && <span>{visualBefore}</span>}
        {highlight}
        {visualAfter && <span>{visualAfter}</span>}
      </span>
      <span className="sr-only">{srOnlyText}</span>
    </>
  );
}
