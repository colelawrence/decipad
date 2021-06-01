import { Box, Center, Grid, Text } from '@chakra-ui/react';
import { DeciEditor } from '@decipad/editor';
import { useRouter } from 'next/router';
import React from 'react';
import { NavigationMenu } from './NavigationMenu/NavigationMenu';
import { Notebooks } from './NavigationMenu/Notebooks/Notebooks';

export const Dashboard = () => {
  const router = useRouter();
  const { workspace, notebook } = router.query;
  return (
    <Grid gridTemplateColumns="0.2fr 0.5fr 1fr" p="12">
      <NavigationMenu workspaceId={workspace as string} />
      <Notebooks workspaceId={workspace as string} />
      <Box px={10}>
        {!router.query.notebook && (
          <Center h="100%">
            <Text opacity="0.5">Select a notebook to start typing!</Text>
          </Center>
        )}
        {notebook && workspace && (
          <DeciEditor
            workspaceId={workspace as string}
            padId={notebook as string}
          />
        )}
      </Box>
    </Grid>
  );
};
