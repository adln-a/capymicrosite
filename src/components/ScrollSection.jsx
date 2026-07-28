import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const HIDDEN = { opacity: 0, y: 24 };
const VISIBLE = { opacity: 1, y: 0 };

/**
 * Fades/slides content up as it scrolls into view. `viewport.once` is false
 * so it replays every time the section re-enters, in either scroll direction.
 * Motion is skipped entirely for prefers-reduced-motion users.
 */
const ScrollSection = forwardRef(function ScrollSection(
  { as = 'div', className, children, ...props },
  ref,
) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={shouldReduceMotion ? false : HIDDEN}
      whileInView={shouldReduceMotion ? undefined : VISIBLE}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </MotionTag>
  );
});

export default ScrollSection;
