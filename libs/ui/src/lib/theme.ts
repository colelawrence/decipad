import { extendTheme } from '@chakra-ui/react';
import { createBreakpoints } from '@chakra-ui/theme-tools';

const breakpoints = createBreakpoints({
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
});

export const theme = extendTheme({
  breakpoints,
  styles: {
    global: {
      'html, body': {
        w: '100vw',
        overflowX: 'hidden',
      },
    },
  },
});
