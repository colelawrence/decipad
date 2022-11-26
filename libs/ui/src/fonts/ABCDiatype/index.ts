import boldWoff from './ABCDiatype-Bold.woff';
import boldWoff2 from './ABCDiatype-Bold.woff2';
import boldItalicWoff from './ABCDiatype-BoldItalic.woff';
import boldItalicWoff2 from './ABCDiatype-BoldItalic.woff2';
import mediumWoff from './ABCDiatype-Medium.woff';
import mediumWoff2 from './ABCDiatype-Medium.woff2';
import regularWoff from './ABCDiatype-Regular.woff';
import regularWoff2 from './ABCDiatype-Regular.woff2';
import regularItalicWoff from './ABCDiatype-RegularItalic.woff';
import regularItalicWoff2 from './ABCDiatype-RegularItalic.woff2';

export const name = '"ABC Diatype"';
export const atRule = `
  @font-face {
    font-family: ${name};
    src: url('${boldWoff2}') format('woff2'), url('${boldWoff}') format('woff');
    font-display: swap;
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: ${name};
    src: url('${boldItalicWoff2}') format('woff2'), url('${boldItalicWoff}') format('woff');
    font-display: swap;
    font-weight: bold;
    font-style: italic;
  }

  @font-face {
    font-family: ${name};
    src: url('${mediumWoff2}') format('woff2'), url('${mediumWoff}') format('woff');
    font-display: swap;
    font-weight: 500 600;
    font-style: normal;
  }

  @font-face {
    font-family: ${name};
    src: url('${regularWoff2}') format('woff2'), url('${regularWoff}') format('woff');
    font-display: swap;
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: ${name};
    src: url('${regularItalicWoff2}') format('woff2'), url('${regularItalicWoff}') format('woff');
    font-display: swap;
    font-weight: normal;
    font-style: italic;
  }
`;
