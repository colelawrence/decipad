import {
  ELEMENT_CAPTION,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_DATA_VIEW,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PLOT,
  ELEMENT_TABLE,
  ELEMENT_VARIABLE_DEF,
} from '../../../editor-types/src';
import { AnyElement } from '../../../editor-types/src/value';
import { codeLineVerbalizer } from './codeLine';
import { defVerbalizer } from './def';
import { tableVerbalizer } from './table';
import { headingVerbalizer } from './headingVerbalizer';
import { Verbalizer } from './types';
import { defaultVerbalizer } from './default';
import { captionVerbalizer } from './caption';

const verbalizers: Partial<Record<AnyElement['type'], Verbalizer>> = {
  [ELEMENT_CODE_LINE_V2]: codeLineVerbalizer,
  [ELEMENT_VARIABLE_DEF]: defVerbalizer,
  [ELEMENT_TABLE]: tableVerbalizer,
  [ELEMENT_H1]: headingVerbalizer,
  [ELEMENT_H2]: headingVerbalizer,
  [ELEMENT_H3]: headingVerbalizer,
  [ELEMENT_DATA_VIEW]: defaultVerbalizer,
  [ELEMENT_PLOT]: defaultVerbalizer,
  [ELEMENT_CAPTION]: captionVerbalizer,
};

export const getVerbalizer = (element: AnyElement): Verbalizer | undefined =>
  verbalizers[element.type];
