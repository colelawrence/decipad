import { css, CSSObject, Global } from '@emotion/react';
import { abcDiatype, abcDiatypeMono } from '../fonts';
import { cssVar, setCssVar } from './var';

/** When the browser is being automated by a test driver, use the fallback font */
const simpleFontIfTesting = (font: string, fallback: string) => {
  if (globalThis.navigator?.webdriver) {
    return fallback;
  }
  return `${font}, ${fallback}`;
};

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

const hFontFamily: TypographyStyles['fontFamily'] = simpleFontIfTesting(
  `${abcDiatype.name}, "Neue Haas Grotesk Display Pro", Helvetica, "Open Sans"`,
  'sans-serif'
);
const hDefault: TypographyStyles = {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  color: cssVar('currentTextColor'),
  fontFamily: hFontFamily,
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: `${24 / usualRemPxs}rem`,
  lineHeight: 1.3,
  letterSpacing: 'unset',
  fontFeatureSettings: 'unset',
};

export const banner: TypographyStyles = {
  ...hDefault,
  fontSize: `${56 / usualRemPxs}rem`,
};
export const display: TypographyStyles = {
  ...hDefault,
  fontSize: `${32 / usualRemPxs}rem`,
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

const pFontFamily: TypographyStyles['fontFamily'] = simpleFontIfTesting(
  abcDiatype.name,
  'sans-serif'
);

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
  ...p8Regular,
  fontWeight: 500,
};
export const p10Regular: TypographyStyles = {
  ...pDefault,
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  fontSize: `${10 / usualRemPxs}rem`,
  lineHeight: 1,
};
export const p10Medium: TypographyStyles = {
  ...p10Regular,
  fontWeight: 500,
};
export const p12Regular: TypographyStyles = {
  ...pDefault,
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  fontSize: `${12 / usualRemPxs}rem`,
  lineHeight: 1.4,
};
export const p12Medium: TypographyStyles = {
  ...p12Regular,
  fontWeight: 500,
};

export const p13Regular: TypographyStyles = {
  ...pDefault,
  fontSize: `${13 / usualRemPxs}rem`,
  lineHeight: 1.36,
};
export const p13Medium: TypographyStyles = {
  ...p13Regular,
  fontWeight: 500,
};

export const p12Bold: TypographyStyles = {
  ...p12Regular,
  fontWeight: 700,
};

export const p13Bold: TypographyStyles = {
  ...p13Regular,
  fontWeight: 700,
};
export const p14Regular: TypographyStyles = {
  ...pDefault,
  fontSize: `${14 / usualRemPxs}rem`,
  lineHeight: 1.4,
};
export const p14Medium: TypographyStyles = {
  ...p14Regular,
  fontWeight: 500,
};
export const p14Bold: TypographyStyles = {
  ...pDefault,
  fontWeight: 700,
  fontSize: `${14 / usualRemPxs}rem`,
  lineHeight: 1.4,
};
export const p15Regular: TypographyStyles = {
  ...pDefault,
  fontSize: `${15 / usualRemPxs}rem`,
  lineHeight: 1.4,
};
export const p15Medium: TypographyStyles = {
  ...p15Regular,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  fontWeight: 500,
  lineHeight: 1,
};
export const p16Regular: TypographyStyles = {
  ...pDefault,
  lineHeight: 1.625,
};
export const p16Medium: TypographyStyles = {
  ...p16Regular,
  fontWeight: 500,
};
export const p16Bold: TypographyStyles = {
  ...p16Regular,
  fontWeight: 700,
};
export const p18Regular: TypographyStyles = {
  ...pDefault,
  fontSize: `${18 / usualRemPxs}rem`,
  lineHeight: 1.45,
};
export const p18Medium: TypographyStyles = {
  ...pDefault,
  fontWeight: 500,
};
export const p20Medium: TypographyStyles = {
  ...pDefault,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  fontWeight: 500,
};
export const p24Medium: TypographyStyles = {
  ...pDefault,
  fontWeight: 500,
  fontSize: `${24 / usualRemPxs}rem`,
  lineHeight: 1.3,
};
export const p32Medium: TypographyStyles = {
  ...pDefault,
  fontWeight: 500,
  fontSize: `${32 / usualRemPxs}rem`,
  lineHeight: 1.36,
};

// monospace

const mFontFamily: TypographyStyles['fontFamily'] = simpleFontIfTesting(
  abcDiatypeMono.name,
  'monospace'
);

export const code: TypographyStyles = {
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  color: cssVar('currentTextColor'),
  fontFamily: mFontFamily,
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontSize: `${14 / usualRemPxs}rem`,
  lineHeight: 1.4,
  letterSpacing: 'unset',
  fontFeatureSettings: 'unset',
};

export const inputLabel = css({
  ...p13Medium,
  color: cssVar('weakTextColor'),
  marginBottom: '8px',
});

export const smallCode: TypographyStyles = {
  ...code,
  fontSize: `${10 / usualRemPxs}rem`,
  lineHeight: 1,
};

export const ellipsis = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
});

// global

export const GlobalTextStyles = (): ReturnType<React.FC> => (
  <>
    {/* @import is not as good for performance as <link rel>, but the web font URLs will need to change with changes to the styles above,
        so it's good to have them co-located, which if using <link> would be more difficult to achieve.
        While these text styles are still undergoing frequent changes, let's keep it like this. */}
    <Global styles={abcDiatype.atRule} />
    <Global styles={abcDiatypeMono.atRule} />
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
