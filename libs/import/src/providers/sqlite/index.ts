import { Provider } from '../types';

export const sqlite: Provider = {
  name: 'sqlite',
  matchUrl: (url) => url.protocol === 'sqlite:',
  import: () => {
    throw new Error('Sqlite is not importable');
  },
};
