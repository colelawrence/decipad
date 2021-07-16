import { CSSObject, Interpolation } from '@emotion/react';
import { cssVar } from './var';

type TypographyStyles = Readonly<
  Required<
    Pick<
      CSSObject,
      | 'color'
      | 'fontFamily'
      | 'fontStyle'
      | 'fontWeight'
      | 'fontSize'
      | 'lineHeight'
      | 'letterSpacing'
      | 'fontFeatureSettings'
    >
  >
>;

const usualRemPxs = 16;

// heading

const hFontFamily: TypographyStyles['fontFamily'] =
  '"Neue Haas Grotesk Display Pro", Helvetica, "Open Sans", sans-serif';

export const display: TypographyStyles = {
  color: cssVar('strongTextColor'),
  fontFamily: hFontFamily,
  fontStyle: 'normal',
  fontWeight: 600,
  fontSize: `${36 / usualRemPxs}rem`,
  lineHeight: '113%',
  letterSpacing: '0.01em',
  fontFeatureSettings: "'ss04' on, 'ss08' on, 'ss06' on",
};
export const h1: TypographyStyles = {
  color: cssVar('strongTextColor'),
  fontFamily: hFontFamily,
  fontStyle: 'normal',
  fontWeight: 600,
  fontSize: `${24 / usualRemPxs}rem`,
  lineHeight: '130%',
  letterSpacing: '0.01em',
  fontFeatureSettings: "'ss04' on, 'ss02' on",
};

// paragraph

const pFontFamily: TypographyStyles['fontFamily'] = 'Inter, sans-serif';

const pDefault: TypographyStyles = {
  color: cssVar('normalTextColor'),
  fontFamily: pFontFamily,
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontSize: '1rem',
  lineHeight: '100%',
  letterSpacing: 'unset',
  fontFeatureSettings: 'unset',
};

export const p12Regular: TypographyStyles = {
  ...pDefault,
  color: cssVar('weakTextColor'),
  fontSize: `${12 / usualRemPxs}rem`,
};
export const p12Bold: TypographyStyles = {
  ...pDefault,
  color: cssVar('strongTextColor'),
  fontWeight: 600,
  fontSize: `${12 / usualRemPxs}rem`,
  lineHeight: '136%',
  letterSpacing: '-0.008em',
};
export const p13SemiBold: TypographyStyles = {
  ...pDefault,
  fontWeight: 600,
  fontSize: `${13 / usualRemPxs}rem`,
  lineHeight: '136%',
  letterSpacing: '-0.008em',
};
export const p15Medium: TypographyStyles = {
  ...pDefault,
  color: cssVar('strongTextColor'),
  fontWeight: 500,
  fontSize: `${15 / usualRemPxs}rem`,
};
export const p16Regular: TypographyStyles = {
  ...pDefault,
  lineHeight: '170%',
  letterSpacing: '-0.004em',
  fontFeatureSettings: "'ss04' on, 'ss02' on",
};

// global

export const globalTextStyles: Interpolation<unknown> = [
  // @import is not as good for performance as <link rel>, but the web font URLs will need to change with changes to the styles above,
  // so it's good to have them co-located, which if using <link> would be more difficult to achieve.
  `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Open+Sans:wght@600&display=swap');`,
  {
    html: {
      ...pDefault,
      textRendering: 'optimizeLegibility',
      fontSmoothing: 'antialiased',
    },
  },
];
