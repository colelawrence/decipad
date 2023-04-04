import { Provider } from '../types';

export const mysql: Provider = {
  name: 'mysql',
  matchUrl: (url) => url.protocol === 'mysql:',
  import: () => {
    throw new Error('MySQL is not importable');
  },
};
