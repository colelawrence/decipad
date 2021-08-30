import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
} from '@udecode/plate';
import { ELEMENT_IMPORT_DATA } from '@decipad/ui';
import { ModelBlock } from './icons/ModelBlock';
import { ImportData } from './icons/ImportData';
import { Subheading } from './icons/Subheading';
import { Subtitle } from './icons/Subtitle';
import { Zap } from './icons/Zap';

export interface Command {
  type: string;
  name: string;
  description: string;
  icon: JSX.Element;
}

export const commands: Command[] = [
  {
    type: ELEMENT_CODE_BLOCK,
    name: 'Model',
    description: 'Formulas, calc and deci language.',
    icon: <ModelBlock />,
  },
  {
    type: ELEMENT_IMPORT_DATA,
    name: 'Import data',
    description: 'Import external data.',
    icon: <ImportData />,
  },
  {
    type: ELEMENT_H2,
    name: 'Subtitle',
    description: 'Create a new section.',
    icon: <Subtitle />,
  },
  {
    type: ELEMENT_H3,
    name: 'Subheading',
    description: 'Create a new sub header.',
    icon: <Subheading />,
  },
  {
    type: ELEMENT_BLOCKQUOTE,
    name: 'Quote',
    description: 'A piece of text that stands out.',
    icon: <Zap />,
  },
];
