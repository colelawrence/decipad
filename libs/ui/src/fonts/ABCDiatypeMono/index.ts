import woff from './ABCDiatypeMono-Regular.woff';
import woff2 from './ABCDiatypeMono-Regular.woff2';

export const name = '"ABCDiatypeMono"';
export const atRule = `
  @font-face {
    font-family: ${name};
    src: url('${woff2}') format('woff2'), url('${woff}') format('woff');
    font-display: swap;
  }
`;
