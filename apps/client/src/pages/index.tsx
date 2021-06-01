import { DeciRuntimeContext, DeciRuntimeProvider } from '@decipad/editor';
import React from 'react';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { Loading } from '../components/Loading/Loading';
import { Login } from '../components/Login/Login';

const Home = () => (
  <DeciRuntimeProvider>
    <DeciRuntimeContext.Consumer>
      {({ runtime, status }) => {
        if (status === 'loading') {
          return <Loading />;
        }
        if (runtime === null) {
          return <Login />;
        }
        return <Dashboard />;
      }}
    </DeciRuntimeContext.Consumer>
  </DeciRuntimeProvider>
);

export default Home;
