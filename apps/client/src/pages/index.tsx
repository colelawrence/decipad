import React from 'react';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { Loading } from '../components/Loading/Loading';
import { Login } from '../components/Login/Login';
import { DeciRuntimeProvider, DeciRuntimeConsumer } from '@decipad/ui';

const Home = () => (
  <DeciRuntimeProvider>
    <DeciRuntimeConsumer>
      {({ runtime, loading }) => {
        if (loading) {
          return <Loading />;
        }
        if (runtime === null) {
          return <Login />;
        }
        return <Dashboard />;
      }}
    </DeciRuntimeConsumer>
  </DeciRuntimeProvider>
);

export default Home;
