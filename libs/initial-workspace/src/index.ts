import type { Document } from '@decipad/editor-types';
import gettingStarted from './gettingStarted.json';
import tutorialNotebook from './tutorialNotebook.json';

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
      title: 'Meet Decipad! Learn the basics',
      content: gettingStarted as Document,
      icon: 'Message-Sun',
      status: 'draft',
    },
  ],
};
