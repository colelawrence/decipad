import { DECORATE_POTENTIAL_FORMULA } from '@decipad/editor-types';

export interface PotentialFormulaDecoration {
  [DECORATE_POTENTIAL_FORMULA]: true;
  location: { anchor: number; focus: number };
}
