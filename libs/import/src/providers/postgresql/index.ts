import { Provider } from '../types';

export const postgresql: Provider = {
  name: 'postgresql',
  matchUrl: (url) => url.protocol === 'postgresql:',
  import: () => {
    throw new Error('PostgresQL is not importable');
  },
};
