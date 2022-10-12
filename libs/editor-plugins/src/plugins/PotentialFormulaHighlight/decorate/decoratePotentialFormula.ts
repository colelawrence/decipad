import { Range } from 'slate';
import {
  DECORATE_POTENTIAL_FORMULA,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import {
  assertElementType,
  filterDecorate,
  memoizeDecorate,
} from '@decipad/editor-utils';
import { isFlagEnabled } from '@decipad/feature-flags';
import { isText } from '@udecode/plate';
import { findPotentialFormulas } from './findPotentialFormulas';
import { PotentialFormulaDecoration } from './interface';

export const decoratePotentialFormula = filterDecorate(
  memoizeDecorate(
    () =>
      ([node, parentPath]): (PotentialFormulaDecoration & Range)[] => {
        assertElementType(node, ELEMENT_PARAGRAPH);

        if (!isFlagEnabled('POTENTIAL_FORMULA_DETECTION')) {
          return [];
        }

        return node.children.flatMap((child, index) => {
          if (!isText(child)) return [];

          const path = [...parentPath, index];

          return findPotentialFormulas(child.text).map(({ anchor, focus }) => {
            return {
              [DECORATE_POTENTIAL_FORMULA]: true,
              anchor: { path, offset: anchor },
              focus: { path, offset: focus },
              location: { anchor, focus },
            };
          });
        });
      }
  ),
  (entry) => entry[0].type === ELEMENT_PARAGRAPH
);
