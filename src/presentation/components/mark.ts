/**
 * Yaman's mark as data, for places that draw it themselves (the glyph field).
 * Same paths as LogoMark.astro and the master file src/assets/brand/logo-master.svg.
 */
export const MARK_VIEWBOX: [number, number, number, number] = [192, 296, 218, 194];

export const MARK_PATHS = {
  bubble:
    'M288.89,369.72c-.03,6.64-.05,13.29-.08,19.93l-17.84-19.93c-20.76,0-41.52,0-62.28,0-8.31,0-15.04-6.74-15.04-15.04v-42.42c0-8.31,6.74-15.04,15.04-15.04h65.15c8.31,0,15.04,6.74,15.04,15.04v57.47Z',
  bar: 'M312.25,488.7h-67.98c-2.53,0-4.17-2.66-3.03-4.92l93.33-184.71c.58-1.14,1.75-1.86,3.03-1.86h67.98c2.53,0,4.17,2.66,3.03,4.92l-93.33,184.71c-.58,1.14-1.75,1.86-3.03,1.86Z',
};

export const MARK_SHAPE = {
  kind: 'path' as const,
  d: [MARK_PATHS.bubble, MARK_PATHS.bar],
  viewBox: MARK_VIEWBOX,
};
