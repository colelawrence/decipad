import { ReactNode } from 'react';
import { Grid, Box } from '@chakra-ui/react';

import { NavigationBar } from '../NavigationBar/NavigationBar';
import { NavigationMenu } from '../NavigationMenu/NavigationMenu';

export const Frame = ({ children }: { children: ReactNode }) => {
  return (
    <Grid p={10} minH="100vh" gridTemplateRows="auto 1fr" gridGap={10}>
      <NavigationBar />
      <Grid gridTemplateColumns="0.2fr 1fr">
        <NavigationMenu />
        <Box px={10} borderRight="1px solid" borderColor="gray.100">
          {children}
        </Box>
      </Grid>
    </Grid>
  );
};
