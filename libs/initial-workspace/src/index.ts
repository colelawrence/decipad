import type { Document } from '@decipad/editor-types';
import welcomeNotebook from './welcomeNotebook.json';
import tutorialNotebook from './tutorialNotebook.json';
import businessNotebook from './businessNotebook.json';

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

export const initialWorkspace: InitialWorkspace = {
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
  ],
};
