import { ReactNode } from 'react';
import { Section } from '../../types';

export type NavigationSidebarProps = Readonly<{
  readonly sections: Section[];
  readonly folderName: string;
  readonly numberCatalog: ReactNode;
}>;
