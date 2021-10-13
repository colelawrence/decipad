import { Icons } from '@decipad/ui';
import { css } from '@emotion/react';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H2,
  ELEMENT_H3,
  SPEditor,
} from '@udecode/plate';
import { Location } from 'slate';
import { ELEMENT_IMPORT_DATA } from '../../utils/elementTypes';
import { ImportData } from './icons/ImportData';
import { ModelBlock } from './icons/ModelBlock';
import { Subheading } from './icons/Subheading';
import { Subtitle } from './icons/Subtitle';
import { Zap } from './icons/Zap';
import { insertBlockOfType } from './utils/insertBlockOfType';
import { insertCodeBlock } from './utils/insertCodeBlock';
import { insertTable } from './utils/insertTable';

const iconStyles = css({
  width: '20px',
  height: '20px',
  '> svg > path': { fill: '#111' },
});

export interface Command {
  readonly name: string;
  readonly description: string;
  readonly icon: JSX.Element;

  readonly insert: (editor: SPEditor, at: Location) => void;
}

export const commands: Command[] = [
  {
    name: 'Formulas',
    description: 'Formulas, calc and deci language.',
    icon: <ModelBlock />,
    insert: insertCodeBlock,
  },
  {
    name: 'Table',
    description: 'Insert tabular data.',
    icon: (
      <div css={iconStyles}>
        <Icons.Table />
      </div>
    ),
    insert: insertTable,
  },
  {
    name: 'Import data',
    description: 'Import external data.',
    icon: <ImportData />,
    insert: insertBlockOfType(ELEMENT_IMPORT_DATA),
  },
  {
    name: 'Subtitle',
    description: 'Create a new section.',
    icon: <Subtitle />,
    insert: insertBlockOfType(ELEMENT_H2),
  },
  {
    name: 'Subheading',
    description: 'Create a new sub header.',
    icon: <Subheading />,
    insert: insertBlockOfType(ELEMENT_H3),
  },
  {
    name: 'Quote',
    description: 'A piece of text that stands out.',
    icon: <Zap />,
    insert: insertBlockOfType(ELEMENT_BLOCKQUOTE),
  },
];
