import { ImportResult, Provider } from '../../types';

export const decipad: Provider = {
  name: 'decipad',
  matchUrl: (url) =>
    (url.hostname === 'localhost' || url.hostname.endsWith('.decipad.com')) &&
    url.pathname.startsWith('/n/'),
  import: (): Promise<ImportResult[]> => {
    throw new Error(
      'Decipad notebooks are not meant to be imported statically. Use a live connection instead'
    );
  },
};
