import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
} from '@udecode/plate';
import { FiCode } from 'react-icons/fi';

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
    icon: <FiCode fontSize="18px" />,
  },
  {
    type: ELEMENT_H2,
    name: 'Heading',
    description: 'Create a new section.',
    icon: <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Aa</p>,
  },
  {
    type: ELEMENT_H3,
    name: 'Subheading',
    description: 'Create a new sub header.',
    icon: <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Cc</p>,
  },
  {
    type: ELEMENT_BLOCKQUOTE,
    name: 'Quote',
    description: 'A piece of text that stands out.',
    icon: <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Qu</p>,
  },
];
