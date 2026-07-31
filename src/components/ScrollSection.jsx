import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const HIDDEN = { opacity: 0, y: 24 };
const VISIBLE = { opacity: 1, y: 0 };

/**
 * Fades/slides content up as it scrolls into view. `viewport.once` is false
 * so it replays every time the section re-enters, in either scroll direction.
 * Motion is skipped entirely for prefers-reduced-motion users.
 *
 * `initial`/`whileInView` can be overridden per-instance (e.g. Section 6's
 * grocery items falling from further above than the default 24px) --
 * pulled out of `...props` explicitly rather than left to spread naturally,
 * so the reduced-motion branch below still gets the final say: an override
 * only ever substitutes for HIDDEN/VISIBLE, it can't bypass the `false`/
 * `undefined` that disables motion entirely.
 */
const ScrollSection = forwardRef(function ScrollSection(
  { as = 'div', className, children, initial: initialOverride, whileInView: whileInViewOverride, ...props },
  ref,
) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={shouldReduceMotion ? false : (initialOverride ?? HIDDEN)}
      whileInView={shouldReduceMotion ? undefined : (whileInViewOverride ?? VISIBLE)}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </MotionTag>
  );
});

export default ScrollSection;
