import { MutableRefObject } from 'react';
import { PlatePlugin } from '@udecode/plate';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { getSyntaxErrorRanges } from '@decipad/editor-utils';
import { atoms } from '@decipad/ui';
import { Parser } from '@decipad/language';
import { decorateCodeLine } from './decorateCodeLine';
import { DECORATION_CODE_SYNTAX } from '../constants';
import { EditableExpression } from '../components';

export const createCodeLinePlugin = (
  parseError: MutableRefObject<Parser.ParserError | undefined>
): PlatePlugin => ({
  key: ELEMENT_CODE_LINE,
  isElement: true,
  component: EditableExpression,
  plugins: [
    {
      key: DECORATION_CODE_SYNTAX,
      type: DECORATION_CODE_SYNTAX,
      isLeaf: true,
      decorate: () => {
        const codeLineDecorator = decorateCodeLine();
        return (entry) => {
          const [, path] = entry;
          let decorations = codeLineDecorator(entry);
          const error = parseError.current;
          if (error) {
            decorations = decorations.concat(
              getSyntaxErrorRanges(path, {
                blockId: '',
                error,
                isSyntaxError: true,
                results: [],
              })
            );
          }
          return decorations;
        };
      },
      component: atoms.CodeSyntax,
    },
  ],
});
