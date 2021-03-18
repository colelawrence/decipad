import { Box, Grid } from '@chakra-ui/react';
import { DeciEditor } from '@decipad/editor';
import React from 'react';
import { v4 } from 'uuid';
import { NavigationBar } from './NavigationBar/Navigationbar';

export const Dashboard = () => {
  return (
    <Grid p={10} minH="100vh" gridTemplateRows="auto 1fr" gridGap={10}>
      <NavigationBar />
      <Grid gridTemplateColumns="0.2fr 0.2fr 1fr">
        <Box bg="blue.50">Menu here</Box>
        <Box>Notebooks here</Box>
        <Box>
          <DeciEditor docId={v4()} />
        </Box>
      </Grid>
    </Grid>
  );
};
