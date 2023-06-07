import type { Document } from '@decipad/editor-types';
import { once } from '@decipad/utils';
import welcomeNotebook from './welcomeNotebook.json';
import tutorialNotebook from './tutorialNotebook.json';
import businessNotebook from './businessNotebook.json';
import veryWeirdLoadingWhenEditing from './veryWeirdLoadingWhenEditing.json';
import everything from './everything.json';

export interface Notebook {
  title: string;
  icon?: string;
  status?: string;
  content: Document;
}

export interface Section {
  name: string;
  color: string;
}
export interface InitialWorkspace {
  notebooks: Array<Notebook>;
  sections: Array<Section>;
}

const isTesting = once(() => !!process.env.JEST_WORKER_ID || !!process.env.CI);
// eslint-disable-next-line no-underscore-dangle
const isLocalDev = once(() => {
  const url = process.env.DECI_APP_URL_BASE;
  return (
    url == null ||
    url.startsWith('http://localhost') ||
    url.startsWith('http://127.0.0.1')
  );
});
const shouldCreateDevNotebooks = once(() => !isTesting() && isLocalDev());

const devOnlyNotebooks = (): InitialWorkspace['notebooks'] => [
  {
    title: 'Very weird loading when editing',
    content: veryWeirdLoadingWhenEditing as Document,
    icon: 'Beach-Sulu',
    status: 'draft',
  },
  {
    title: 'Everything, everywhere, all at once',
    content: everything as Document,
    icon: 'Beach-Sulu',
    status: 'draft',
  },
];

export const initialWorkspace = (): InitialWorkspace => ({
  sections: [
    {
      name: 'Personal',
      color: '#c1c7f8',
    },
  ],
  notebooks: [
    {
      title: 'Weekend Trip - Example Notebook',
      content: tutorialNotebook as Document,
      icon: 'Beach-Sulu',
      status: 'draft',
    },
    {
      title: 'Starting a Business - Example Notebook',
      content: businessNotebook as Document,
      icon: 'Wallet-Perfume',
      status: 'draft',
    },
    {
      title: 'Welcome to Decipad!',
      content: welcomeNotebook as Document,
      icon: 'Message-Sun',
      status: 'draft',
    },
    ...(shouldCreateDevNotebooks() ? devOnlyNotebooks() : []),
  ],
});
