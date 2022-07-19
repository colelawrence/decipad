import woff from './font.woff';
import woff2 from './font.woff2';

export const name = '"ABCDiatypeMono-Regular"';
export const atRule = `
  @font-face {
    font-family: ${name};
    src: url('${woff2}') format('woff2'), url('${woff}') format('woff');
    font-display: swap;
  }
`;
