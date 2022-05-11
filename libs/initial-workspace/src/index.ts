import { Document } from '@decipad/editor-types';
import gettingStarted from './gettingStarted.json';
import tutorialNotebook from './tutorialNotebook.json';

export interface Notebook {
  title: string;
  icon?: string;
  content: Document;
}
export interface InitialWorkspace {
  notebooks: Array<Notebook>;
}

export const initialWorkspace: InitialWorkspace = {
  notebooks: [
    {
      title: 'Weekend Trip - Example Notebook',
      content: tutorialNotebook as Document,
      icon: 'Beach-Sulu',
    },
    {
      title: 'Meet Decipad! Learn the basics',
      content: gettingStarted as Document,
      icon: 'Message-Sun',
    },
  ],
};
