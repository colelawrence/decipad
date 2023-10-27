import { Range } from 'slate';
import {
  DECORATE_POTENTIAL_FORMULA,
  ELEMENT_PARAGRAPH,
  markKinds,
  MyEditor,
  MyText,
  MyValue,
} from '@decipad/editor-types';
import {
  assertElementType,
  filterDecorate,
  memoizeDecorate,
} from '@decipad/editor-utils';
import { isElement, isText } from '@udecode/plate';
import { findPotentialFormulas } from './findPotentialFormulas';
import { PotentialFormulaDecoration } from './interface';

const allMarks = new Set<string>(Object.values(markKinds));
const hasTextMark = (text: MyText) =>
  Object.keys(text).some((key) => allMarks.has(key));

export const decoratePotentialFormula = filterDecorate<
  unknown,
  MyValue,
  MyEditor
>(
  memoizeDecorate<unknown, MyValue, MyEditor>(
    () =>
      ([node, parentPath]): (PotentialFormulaDecoration & Range)[] => {
        assertElementType(node, ELEMENT_PARAGRAPH);

        return node.children.flatMap((child, index) => {
          if (!isText(child) || hasTextMark(child)) {
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
  ([node]) => isElement(node) && node.type === ELEMENT_PARAGRAPH
);
