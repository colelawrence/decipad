import { Box, Grid } from '@chakra-ui/react';
import React from 'react';
import { NavigationBar } from '../components/Dashboard/NavigationBar/NavigationBar';
import { NavigationMenu } from '../components/Dashboard/NavigationMenu/NavigationMenu';
import { Notebooks } from '../components/Dashboard/Notebooks/Notebooks';
import { useStore } from '../store';

const Dashboard = () => {
  const notebooks = useStore((state) => state.notebooks);
  return (
    <Grid gridTemplateRows="auto 1fr" p={10} minH="100vh">
      <NavigationBar />
      <Grid gridTemplateColumns="0.3fr 0.5fr 1fr" gridGap={10}>
        <NavigationMenu />
        <Notebooks notebooks={notebooks} />
        <Box>Editor here</Box>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
