import {
  DECORATE_POTENTIAL_FORMULA,
  MyPlatePlugin,
} from '@decipad/editor-types';
import { decoratePotentialFormula } from './decorate/decoratePotentialFormula';
import { PotentialFormulaHighlight } from './component/PotentialFormulaHighlight';

/**
 * Decorates things that look like code, so users can turn it into a formula
 *
 * Eg: 50 * 10
 */
export const createPotentialFormulaHighlightPlugin = (
  isReadonly: boolean
): MyPlatePlugin => ({
  key: DECORATE_POTENTIAL_FORMULA,
  isLeaf: true,
  component: PotentialFormulaHighlight,
  decorate: isReadonly ? undefined : decoratePotentialFormula,
});
