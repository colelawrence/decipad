import { CSSObject, Global } from '@emotion/react';
import { allianceNo1Medium } from '../fonts';
import { cssVar, setCssVar } from './var';

export type TypographyStyles = Readonly<
  Required<
    Pick<
      CSSObject,
      | '--deci-currentTextColor'
      | 'color'
      | 'fontFamily'
      | 'fontStyle'
      | 'fontWeight'
      | 'fontSize'
      | 'letterSpacing'
      | 'fontFeatureSettings'
    > & {
      lineHeight: number;
    }
  >
>;

const usualRemPxs = 16;

// heading

const hFontFamily: TypographyStyles['fontFamily'] =
  'Inter, "Neue Haas Grotesk Display Pro", Helvetica, "Open Sans", sans-serif';

const hDefault: TypographyStyles = {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  color: cssVar('currentTextColor'),
  fontFamily: hFontFamily,
  fontStyle: 'normal',
  fontWeight: 600,
  fontSize: `${24 / usualRemPxs}rem`,
  lineHeight: 1.3,
  letterSpacing: '0.01em',
  fontFeatureSettings: 'unset',
};

export const banner: TypographyStyles = {
  ...hDefault,
  fontFamily: allianceNo1Medium.name,
  fontSize: `${56 / usualRemPxs}rem`,
  fontWeight: 400,
  letterSpacing: '-0.01em',
  lineHeight: 1.05,
};
export const display: TypographyStyles = {
  ...hDefault,
  fontSize: `${32 / usualRemPxs}rem`,
  fontWeight: 500,
  letterSpacing: '-0.01em',
  lineHeight: 1.21,
  fontFeatureSettings: "'ss04' on, 'ss08' on, 'ss06' on",
};
export const h1: TypographyStyles = {
  ...hDefault,
  fontSize: `${24 / usualRemPxs}rem`,
  fontFeatureSettings: "'ss04' on, 'ss02' on",
};
export const h2: TypographyStyles = {
  ...hDefault,
  fontSize: `${20 / usualRemPxs}rem`,
};

// paragraph

const pFontFamily: TypographyStyles['fontFamily'] = 'Inter, sans-serif';

const pDefault: TypographyStyles = {
  ...setCssVar('currentTextColor', cssVar('normalTextColor')),
  color: cssVar('currentTextColor'),
  fontFamily: pFontFamily,
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontSize: '1rem',
  lineHeight: 1,
  letterSpacing: 'unset',
  fontFeatureSettings: 'unset',
};

export const p8Regular: TypographyStyles = {
  ...pDefault,
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  fontSize: `${8 / usualRemPxs}rem`,
  lineHeight: 1,
};
export const p8Medium: TypographyStyles = {
  ...pDefault,
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  fontSize: `${8 / usualRemPxs}rem`,
  fontWeight: 500,
};
export const p12Regular: TypographyStyles = {
  ...pDefault,
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  fontSize: `${12 / usualRemPxs}rem`,
};
export const p12Medium: TypographyStyles = {
  ...pDefault,
  fontWeight: 500,
  fontSize: `${12 / usualRemPxs}rem`,
  lineHeight: 1.4,
};
export const p12Bold: TypographyStyles = {
  ...pDefault,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  fontWeight: 600,
  fontSize: `${12 / usualRemPxs}rem`,
  lineHeight: 1.36,
  letterSpacing: '-0.008em',
};
export const p13Regular: TypographyStyles = {
  ...pDefault,
  fontSize: `${13 / usualRemPxs}rem`,
};
export const p13Medium: TypographyStyles = {
  ...pDefault,
  fontWeight: 500,
  fontSize: `${13 / usualRemPxs}rem`,
  lineHeight: 1.36,
  letterSpacing: '-0.008em',
};
export const p13SemiBold: TypographyStyles = {
  ...pDefault,
  fontWeight: 600,
  fontSize: `${13 / usualRemPxs}rem`,
  lineHeight: 1.36,
  letterSpacing: '-0.008em',
};
export const p14Regular: TypographyStyles = {
  ...pDefault,
  fontSize: `${14 / usualRemPxs}rem`,
  lineHeight: 1.4,
  letterSpacing: '-0.002em',
};
export const p14Medium: TypographyStyles = {
  ...pDefault,
  fontWeight: 500,
  fontSize: `${14 / usualRemPxs}rem`,
  lineHeight: 1.4,
};
export const p15Regular: TypographyStyles = {
  ...pDefault,
  fontSize: `${15 / usualRemPxs}rem`,
  lineHeight: 1.4,
  letterSpacing: '-0.002em',
};
export const p15Medium: TypographyStyles = {
  ...pDefault,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  fontWeight: 500,
  fontSize: `${15 / usualRemPxs}rem`,
};
export const p16Regular: TypographyStyles = {
  ...pDefault,
  lineHeight: 1.7,
  letterSpacing: '-0.004em',
  fontFeatureSettings: "'ss04' on, 'ss02' on",
};
export const p16Bold: TypographyStyles = {
  ...pDefault,
  fontWeight: 600,
  lineHeight: 1.7,
  letterSpacing: '-0.004em',
  fontFeatureSettings: "'ss04' on, 'ss02' on",
};
export const p18Regular: TypographyStyles = {
  ...pDefault,
  fontSize: `${18 / usualRemPxs}rem`,
  lineHeight: 1.45,
  letterSpacing: '-0.2px',
};
export const p20Medium: TypographyStyles = {
  ...pDefault,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  fontWeight: 500,
};
export const p24Bold: TypographyStyles = {
  ...pDefault,
  fontWeight: 600,
  fontSize: `${24 / usualRemPxs}rem`,
};
export const p32Medium: TypographyStyles = {
  ...pDefault,
  fontWeight: 500,
  fontSize: `${32 / usualRemPxs}rem`,
  lineHeight: 1.36,
  letterSpacing: '-0.8%',
};

// monospace

const mFontFamily: TypographyStyles['fontFamily'] =
  '"ABCDiatypeMono-Regular", monospace';

export const code: TypographyStyles = {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  color: cssVar('currentTextColor'),
  fontFamily: mFontFamily,
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontSize: `${14 / usualRemPxs}rem`,
  lineHeight: 1.4,
  letterSpacing: '-0.8%',
  fontFeatureSettings: 'unset',
};

// global

export const GlobalTextStyles = (): ReturnType<React.FC> => (
  <>
    {/* @import is not as good for performance as <link rel>, but the web font URLs will need to change with changes to the styles above,
        so it's good to have them co-located, which if using <link> would be more difficult to achieve.
        While these text styles are still undergoing frequent changes, let's keep it like this. */}
    <Global styles="@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');" />
    <Global styles={allianceNo1Medium.atRule} />
    <Global
      styles={{
        html: {
          ...pDefault,
          textRendering: 'optimizeLegibility',
          fontSmoothing: 'antialiased',
        },
      }}
    />
  </>
);
