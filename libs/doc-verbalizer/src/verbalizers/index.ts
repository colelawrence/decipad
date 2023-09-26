import {
  ELEMENT_CODE_LINE_V2,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
import { AnyElement } from '../../../editor-types/src/value';
import { codeLineVerbalizer } from './codeLine';
import { defVerbalizer } from './def';
import { tableVerbalizer } from './table';

type Verbalizer = (block: AnyElement) => string;

const verbalizers: Partial<Record<AnyElement['type'], Verbalizer>> = {
  [ELEMENT_CODE_LINE_V2]: codeLineVerbalizer,
  [ELEMENT_VARIABLE_DEF]: defVerbalizer,
  [ELEMENT_TABLE]: tableVerbalizer,
};

export const getVerbalizer = (element: AnyElement): Verbalizer | undefined =>
  verbalizers[element.type];
