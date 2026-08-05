# Responsive breakpoints

| Tier | Range | Device |
|---|---|---|
| **S** | under 640px | Mobile |
| **M** | 640px – 991px | Tablet portrait |
| **L** | 992px – 1200px | Tablet landscape |
| **XL** | above 1200px | Desktop |

There is no separate "XS" tier — S covers everything below 640px on its own. S and M often reuse the same asset/value (no dedicated S-only asset), since S is really "M, but the viewport is narrower."

## Implementation

Defined in `src/index.css`, inside the `@theme` block:

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 992px;
--breakpoint-xl: 1200px;
```

`sm` and `md` are Tailwind's own defaults (640px/768px) — but they're declared explicitly here, not left implicit. `lg` and `xl` are the real overrides (from Tailwind's defaults of 1024px/1280px).

### Why sm/md are redeclared even though their values don't change

Tailwind v4 sorts a utility's responsive variants for cascade purposes by which breakpoints were explicitly customized in the theme, not by their numeric px value. When only `lg`/`xl` were overridden and `sm`/`md` were left untouched, Tailwind compiled the `lg`/`xl` variants *before* the `sm`/`md` ones in the generated stylesheet. At any viewport where both a `sm:` and an `xl:` rule apply to the same element (e.g. 1440px width matches both), the one that appears **later** in the stylesheet wins when specificity is tied — so `sm:` was silently overriding `xl:`, regardless of actual screen width.

This caused two real, silent bugs before it was caught:
- Section 5's text card was stuck at 640px instead of growing to 800px at desktop widths.
- Section 1's fluid card-width `clamp()` formula was capped at 720px instead of reaching 800px from ~992px up.

**The fix:** redeclare *every* breakpoint you touch — including the ones you're not changing the value of — in the same `@theme` block. This puts all four breakpoints on equal footing in Tailwind's internal bookkeeping, so they sort correctly by pixel value again (640 < 768 < 992 < 1200).

**Takeaway for future breakpoint changes on this project:** never override just `lg`/`xl` (or any subset) in isolation — always redeclare the full set of breakpoints you're using together, even the ones staying at their default value.
