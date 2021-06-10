import { Box, chakra, Grid, Text } from '@chakra-ui/react';

export const Wrapper = chakra(Box, {
  baseStyle: {
    minH: '100vh',
    w: '100vw',
    bgImage: 'url(/assets/landing-wallpaper.png)',
    bgPos: 'center center',
    bgSize: 'cover',
    bgRepeat: 'no-repeat',
  },
});

export const Layout = chakra(Grid, {
  baseStyle: {
    minH: '100vh',
    w: '100%',
    gridTemplateRows: 'auto 1fr auto',
    p: '50px 150px',
  },
});

export const BodyText = chakra(Text, {
  baseStyle: {
    opacity: 0.7,
  },
});
