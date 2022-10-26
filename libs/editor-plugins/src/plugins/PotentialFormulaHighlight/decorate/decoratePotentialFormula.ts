import { Range } from 'slate';
import {
  DECORATE_POTENTIAL_FORMULA,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
} from '@decipad/editor-types';
import {
  assertElementType,
  filterDecorate,
  memoizeDecorate,
} from '@decipad/editor-utils';
import { isText } from '@udecode/plate';
import { findPotentialFormulas } from './findPotentialFormulas';
import { PotentialFormulaDecoration } from './interface';

export const decoratePotentialFormula = filterDecorate(
  memoizeDecorate(
    () =>
      ([node, parentPath]): (PotentialFormulaDecoration & Range)[] => {
        assertElementType(node, ELEMENT_PARAGRAPH);

        return node.children.flatMap((child, index) => {
          if (!isText(child) || child[MARK_MAGICNUMBER]) {
            return [];
          }

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
