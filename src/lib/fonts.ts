import localFont from 'next/font/local'

/**
 * Self-hosted web fonts.
 *
 * All font files live in `src/fonts/` and are committed to the repository, so
 * `next build` never downloads fonts from Google (previously a flaky network
 * dependency that failed CI and skipped deploys). The files, their upstream
 * provenance and the subsetting recipe are documented in
 * `scripts/fonts/build_local_fonts.py` and `src/fonts/manifest.json`.
 *
 * Each family is registered with two `localFont()` calls that share one CSS
 * `font-family` name, exactly like the Google Fonts CSS they replace. next/font
 * names a family after the JS constant it is assigned to (`lato` -> "lato"),
 * so every `*Ext` call declares the base constant's name as its font-family.
 *
 *   - `*-latin.woff2` covers the Latin subset. It is preloaded and generates
 *     the size-adjusted fallback face that prevents layout shift.
 *   - `*-ext.woff2` covers the other subsets Google served for that family
 *     (Latin Extended; plus Greek for Open Sans and Fira Code, and box
 *     drawing for Fira Code). It is NOT preloaded; the browser fetches it
 *     only when a page contains a character in its `unicode-range`.
 *
 * Components consume the fonts through CSS variables (`--font-lato`, ...; see
 * `globals.css`). Layouts apply them via `siteFontVariables` /
 * `presentationFontVariables` at the bottom of this file, which include each
 * `*Ext` class so its @font-face rules are emitted. The `--font-*-ext`
 * variables themselves are intentionally unused.
 *
 * next/font requires literal option values, so each call spells out its
 * unicode-range. The values must equal `unicode_range` for the same files in
 * `src/fonts/manifest.json` (the Latin range is Google's; each Ext range is
 * exactly the code points that file contains). `__tests__/lib/fonts.test.ts`
 * enforces this.
 */

export const openSans = localFont({
  src: [
    { path: '../fonts/opensans/OpenSans-Variable-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/opensans/OpenSans-Variable-latin.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/opensans/OpenSans-Variable-latin.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/opensans/OpenSans-Variable-latin.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/opensans/OpenSans-Variable-latin.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-open-sans',
  adjustFontFallback: 'Arial',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const openSansExt = localFont({
  src: [
    { path: '../fonts/opensans/OpenSans-Variable-ext.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/opensans/OpenSans-Variable-ext.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/opensans/OpenSans-Variable-ext.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/opensans/OpenSans-Variable-ext.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/opensans/OpenSans-Variable-ext.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-open-sans-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'openSans'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0130, U+0132-0151, U+0154-017F, U+0192, U+01A0-01A1, U+01AF-01B0, U+01EA-01ED, U+01F0, U+01FA-01FF, U+0218-021B, U+0237, U+0259, U+02C7, U+02C9, U+02DD, U+02F3, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03CE, U+03D1-03D2, U+03D6, U+1E00-1E01, U+1E3E-1E3F, U+1E80-1E85, U+1E9E, U+1EF2-1EF9, U+20A3-20A4, U+20A7, U+20AA-20AB, U+2113, U+A7B3-A7B5',
    },
  ],
})

export const lato = localFont({
  src: [
    { path: '../fonts/lato/Lato-400-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/lato/Lato-700-latin.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-lato',
  adjustFontFallback: 'Arial',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const latoExt = localFont({
  src: [
    { path: '../fonts/lato/Lato-400-ext.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/lato/Lato-700-ext.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-lato-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'lato'" },
    {
      prop: 'unicode-range',
      value:
        'U+0104-0107, U+0118-0119, U+0141-0144, U+015A-015B, U+0160-0161, U+0178-017E, U+0192, U+02C7, U+02C9, U+02DD',
    },
  ],
})

export const raleway = localFont({
  src: [
    { path: '../fonts/raleway/Raleway-Variable-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/raleway/Raleway-Variable-latin.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/raleway/Raleway-Variable-latin.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/raleway/Raleway-Variable-latin.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-raleway',
  adjustFontFallback: 'Arial',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const ralewayExt = localFont({
  src: [
    { path: '../fonts/raleway/Raleway-Variable-ext.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/raleway/Raleway-Variable-ext.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/raleway/Raleway-Variable-ext.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/raleway/Raleway-Variable-ext.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-raleway-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'raleway'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0130, U+0132-0151, U+0154-017E, U+018F, U+0192, U+01A0-01A1, U+01AF-01B0, U+01C4-01CC, U+01E6-01E7, U+01EA-01EB, U+01F1-01F5, U+01FA-021B, U+022A-022D, U+0230-0233, U+0237, U+0259, U+02B9-02BA, U+02BE-02BF, U+02C7-02CC, U+02DD, U+1E08-1E09, U+1E0C-1E0F, U+1E14-1E17, U+1E1C-1E1D, U+1E20-1E21, U+1E24-1E25, U+1E2A-1E2B, U+1E2E-1E2F, U+1E36-1E37, U+1E3A-1E3B, U+1E42-1E49, U+1E4C-1E53, U+1E5A-1E5B, U+1E5E-1E69, U+1E6C-1E6F, U+1E78-1E7B, U+1E80-1E85, U+1E8E-1E8F, U+1E92-1E93, U+1E97, U+1E9E, U+1EF2-1EF9, U+20A1, U+20A3-20A4, U+20A6-20A7, U+20A9, U+20AB, U+20AD-20AE, U+20B1-20B2, U+20B4-20B5, U+20B8-20BA, U+20BC-20BD, U+2113',
    },
  ],
})

export const faustina = localFont({
  src: [
    { path: '../fonts/faustina/Faustina-Variable-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/faustina/Faustina-Variable-latin.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/faustina/Faustina-Variable-latin.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/faustina/Faustina-Variable-latin.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-faustina',
  adjustFontFallback: 'Times New Roman',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const faustinaExt = localFont({
  src: [
    { path: '../fonts/faustina/Faustina-Variable-ext.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/faustina/Faustina-Variable-ext.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/faustina/Faustina-Variable-ext.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/faustina/Faustina-Variable-ext.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-faustina-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'faustina'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0130, U+0132-0151, U+0154-017F, U+018F, U+0192, U+019D, U+01A0-01A1, U+01AF-01B0, U+01C4-01DC, U+01E6-01E7, U+01EA-01EB, U+01F1-01F4, U+01FA-021B, U+022A-022D, U+0230-0233, U+0237, U+0259, U+0272, U+02B9-02BA, U+02C7, U+02C9, U+02DD, U+1E0C, U+1E80-1E85, U+1E9E, U+1EF2-1EF9, U+20A1, U+20A3-20A4, U+20A6-20A7, U+20A9, U+20AB, U+20AD, U+20B1-20B2, U+20B5, U+20B9-20BA, U+20BC-20BD, U+2113, U+A78B-A78C',
    },
  ],
})

export const cantataOne = localFont({
  src: [{ path: '../fonts/cantataone/CantataOne-400-latin.woff2', weight: '400', style: 'normal' }],
  display: 'swap',
  variable: '--font-cantata-one',
  adjustFontFallback: 'Times New Roman',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const cantataOneExt = localFont({
  src: [{ path: '../fonts/cantataone/CantataOne-400-ext.woff2', weight: '400', style: 'normal' }],
  display: 'swap',
  variable: '--font-cantata-one-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'cantataOne'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0130, U+0132-0148, U+014A-0151, U+0154-017E, U+0192, U+01FC-01FD, U+0218-0219, U+0237, U+02C7, U+02DD, U+1E02-1E03, U+1E0A-1E0B, U+1E1E-1E1F, U+1E40-1E41, U+1E56-1E57, U+1E60-1E61, U+1E6A-1E6B, U+1E80-1E85, U+1EF2-1EF3',
    },
  ],
})

export const faunaOne = localFont({
  src: [{ path: '../fonts/faunaone/FaunaOne-400-latin.woff2', weight: '400', style: 'normal' }],
  display: 'swap',
  variable: '--font-fauna-one',
  adjustFontFallback: 'Times New Roman',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const faunaOneExt = localFont({
  src: [{ path: '../fonts/faunaone/FaunaOne-400-ext.woff2', weight: '400', style: 'normal' }],
  display: 'swap',
  variable: '--font-fauna-one-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'faunaOne'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0130, U+0132-0151, U+0154-017E, U+0192, U+01FA-01FF, U+0218-021B, U+0237, U+02C7, U+02DD, U+1E80-1E85, U+1EF2-1EF3, U+20A3-20A4, U+2113',
    },
  ],
})

export const montserrat = localFont({
  src: [
    { path: '../fonts/montserrat/Montserrat-Variable-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/montserrat/Montserrat-Variable-latin.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/montserrat/Montserrat-Variable-latin.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/montserrat/Montserrat-Variable-latin.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-montserrat',
  adjustFontFallback: 'Arial',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const montserratExt = localFont({
  src: [
    { path: '../fonts/montserrat/Montserrat-Variable-ext.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/montserrat/Montserrat-Variable-ext.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/montserrat/Montserrat-Variable-ext.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/montserrat/Montserrat-Variable-ext.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-montserrat-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'montserrat'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0130, U+0132-0151, U+0154-0183, U+0186-018C, U+018E-0194, U+0196-01A1, U+01A4-01A6, U+01A9, U+01AC-01B9, U+01C0-01F5, U+01F8-0220, U+0222-0223, U+0226-0233, U+0237, U+023A-023E, U+0241-0251, U+0253-0254, U+0256-0259, U+025B-025C, U+025F-0260, U+0263-0266, U+0268-026C, U+026F, U+0271-0272, U+0274-0275, U+027D-027E, U+0280, U+0283, U+0287-028C, U+028E, U+0292, U+0294-0295, U+0298, U+029D, U+02B0, U+02B7-02BA, U+02BD-02C1, U+02C7-02CC, U+02D7, U+02DD, U+02EC, U+02EE, U+02FB-02FC, U+1D3A, U+1D43, U+1D49, U+1D4B, U+1D52-1D53, U+1D58, U+1D5B, U+1D7B, U+1D7D-1D7E, U+1D91, U+1DA4, U+1DB6, U+1DBB, U+1DBF, U+1E00-1E9B, U+1E9E, U+1EF2-1EF9, U+20A1, U+20A3-20A4, U+20A6-20A7, U+20A9, U+20AB, U+20AD-20AE, U+20B1-20B2, U+20B4-20B5, U+20B8-20BA, U+20BC-20BD, U+20BF, U+2113, U+2C60-2C66, U+2C6D-2C6F, U+2C72-2C73, U+A726-A727, U+A740-A741, U+A789-A78D, U+A792-A793, U+A7A8-A7AB, U+A7AD-A7AE, U+A7B1-A7B9, U+A7C7-A7C8, U+A7CB-A7CD, U+A7DA-A7DC',
    },
  ],
})

export const cinzel = localFont({
  src: [
    { path: '../fonts/cinzel/Cinzel-Variable-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cinzel/Cinzel-Variable-latin.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/cinzel/Cinzel-Variable-latin.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/cinzel/Cinzel-Variable-latin.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-cinzel',
  adjustFontFallback: 'Times New Roman',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const cinzelExt = localFont({
  src: [
    { path: '../fonts/cinzel/Cinzel-Variable-ext.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cinzel/Cinzel-Variable-ext.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/cinzel/Cinzel-Variable-ext.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/cinzel/Cinzel-Variable-ext.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-cinzel-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'cinzel'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0107, U+010A-0113, U+0116-011B, U+011E-0123, U+0126-0127, U+012A-012B, U+012E-0130, U+0132-0133, U+0136-0137, U+0139-0148, U+014A-014D, U+0150-0151, U+0154-015B, U+015E-0167, U+016A-016B, U+016E-017E, U+0192, U+0218-021B, U+02C7, U+02DD, U+1E80-1E85, U+1EF2-1EF3',
    },
  ],
})

export const outfit = localFont({
  src: [
    { path: '../fonts/outfit/Outfit-Variable-latin.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/outfit/Outfit-Variable-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/outfit/Outfit-Variable-latin.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/outfit/Outfit-Variable-latin.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-outfit',
  adjustFontFallback: 'Arial',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const outfitExt = localFont({
  src: [
    { path: '../fonts/outfit/Outfit-Variable-ext.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/outfit/Outfit-Variable-ext.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/outfit/Outfit-Variable-ext.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/outfit/Outfit-Variable-ext.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-outfit-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'outfit'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0107, U+010A-0113, U+0116-011B, U+011E-0123, U+0126-0127, U+012A-012B, U+012E-0130, U+0132-0133, U+0136-0137, U+0139-013E, U+0141-0148, U+014A-014D, U+0150-0151, U+0154-015B, U+015E-0161, U+0164-0165, U+016A-017E, U+01CD-01CE, U+0218-021B, U+0237, U+02C7, U+02DD, U+1E80-1E85, U+1E9E, U+1EF2-1EF3',
    },
  ],
})

export const plusJakartaSans = localFont({
  src: [
    {
      path: '../fonts/plusjakartasans/PlusJakartaSans-Variable-latin.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/plusjakartasans/PlusJakartaSans-Variable-latin.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/plusjakartasans/PlusJakartaSans-Variable-latin.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
  adjustFontFallback: 'Arial',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const plusJakartaSansExt = localFont({
  src: [
    {
      path: '../fonts/plusjakartasans/PlusJakartaSans-Variable-ext.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/plusjakartasans/PlusJakartaSans-Variable-ext.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/plusjakartasans/PlusJakartaSans-Variable-ext.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-plus-jakarta-sans-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'plusJakartaSans'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0130, U+0132-0148, U+014A-0151, U+0154-017E, U+018F, U+0192, U+01A0-01A1, U+01AF-01B0, U+01C4-01CC, U+01E6-01E7, U+01EA-01EB, U+01FA-021B, U+022A-022D, U+0230-0233, U+0237, U+0259, U+02C7, U+02DD, U+1E08-1E09, U+1E0C-1E0F, U+1E14-1E17, U+1E1C-1E1D, U+1E20-1E21, U+1E24-1E25, U+1E2A-1E2B, U+1E2E-1E2F, U+1E36-1E37, U+1E3A-1E3B, U+1E42-1E49, U+1E4C-1E53, U+1E5A-1E5B, U+1E5E-1E69, U+1E6C-1E6F, U+1E78-1E7B, U+1E80-1E85, U+1E8E-1E8F, U+1E92-1E93, U+1E97, U+1E9E, U+1EF2-1EF9, U+20A1, U+20A3-20A4, U+20A6-20AB, U+20AD-20AE, U+20B1-20B5, U+20B8-20BA, U+20BC-20BF, U+2113',
    },
  ],
})

export const firaCode = localFont({
  src: [
    { path: '../fonts/firacode/FiraCode-Variable-latin.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/firacode/FiraCode-Variable-latin.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-fira-code',
  adjustFontFallback: 'Arial',
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
})

export const firaCodeExt = localFont({
  src: [
    { path: '../fonts/firacode/FiraCode-Variable-ext.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/firacode/FiraCode-Variable-ext.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-fira-code-ext',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: 'font-family', value: "'firaCode'" },
    {
      prop: 'unicode-range',
      value:
        'U+0100-0130, U+0132-0151, U+0154-017E, U+0192, U+01FC-01FF, U+0218-021B, U+0237, U+02B9-02BA, U+02C7, U+02C9, U+02DD, U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03E1, U+03F0-03FF, U+1E80-1E85, U+1E9E, U+1EF2-1EF3, U+20AF, U+20B9-20BA, U+20BD, U+2113, U+2500-259F',
    },
  ],
})

/** CSS-variable classes for the site-wide fonts; apply once on <body>. */
export const siteFontVariables = [
  openSans.variable,
  openSansExt.variable,
  lato.variable,
  latoExt.variable,
  raleway.variable,
  ralewayExt.variable,
  faustina.variable,
  faustinaExt.variable,
  cantataOne.variable,
  cantataOneExt.variable,
  faunaOne.variable,
  faunaOneExt.variable,
  montserrat.variable,
  montserratExt.variable,
  cinzel.variable,
  cinzelExt.variable,
].join(' ')

/** CSS-variable classes for the slide-deck fonts used by presentation layouts. */
export const presentationFontVariables = [
  outfit.variable,
  outfitExt.variable,
  plusJakartaSans.variable,
  plusJakartaSansExt.variable,
  firaCode.variable,
  firaCodeExt.variable,
].join(' ')
