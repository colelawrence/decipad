import { Box, Center, Grid, Text } from '@chakra-ui/react';
import { DeciEditor } from '@decipad/editor';
import { useRouter } from 'next/router';
import React from 'react';
import { NavigationBar } from './NavigationBar/Navigationbar';
import { NavigationMenu } from './NavigationMenu/NavigationMenu';
import { Notebooks } from './NavigationMenu/Notebooks/Notebooks';

export const Dashboard = () => {
  const router = useRouter();
  const { workspace } = router.query;
  return (
    <Grid p={10} minH="100vh" gridTemplateRows="auto 1fr" gridGap={10}>
      <NavigationBar />
      <Grid gridTemplateColumns="0.2fr 0.5fr 1fr">
        <NavigationMenu />
        <Notebooks workspaceId={workspace as string} />
        <Box px={10}>
          {!router.query.notebook && (
            <Center h="100%">
              <Text opacity="0.5">Select a notebook to start typing!</Text>
            </Center>
          )}
          {router.query.notebook && (
            <DeciEditor docId={router.query.notebook as string} />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};
