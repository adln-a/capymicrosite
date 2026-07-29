/**
 * Material Symbols (Rounded), rendered via the font's ligature feature --
 * a <span> whose text content is the icon's name (e.g. "play_arrow")
 * displays as the glyph once the font-face + .material-symbols-rounded
 * class (both in index.css) are loaded. `fill` toggles the filled/outlined
 * variant (the FILL axis); `size` sets the glyph's rendered font-size in
 * px, which is how Material Symbols scales (there's no separate
 * width/height to set, unlike the hand-drawn SVG icons above).
 */
export function MaterialIcon({ name, fill = false, size = 24, className = '', style, ...props }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
      {...props}
    >
      {name}
    </span>
  );
}

export function DownloadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
