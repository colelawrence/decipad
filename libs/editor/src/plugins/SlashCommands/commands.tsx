import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
} from '@udecode/plate';
import { ModelBlock } from './icons/ModelBlock';
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
