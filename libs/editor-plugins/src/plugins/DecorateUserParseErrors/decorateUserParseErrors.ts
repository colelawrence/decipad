import { Computer } from '@decipad/computer';
import { DECORATE_SYNTAX_ERROR, MyEditor } from '@decipad/editor-types';
import {
  TElement,
  isElement,
  getStartPoint,
  getEndPoint,
} from '@udecode/plate';
import { NodeEntry } from 'slate';
import { SyntaxErrorAnnotation } from '../../types';

type ElementWithId = TElement & { id: string };

export const decorateUserParseErrors =
  (computer: Computer) =>
  (editor: MyEditor) =>
  ([node, path]: NodeEntry): SyntaxErrorAnnotation[] | undefined => {
    if (isElement(node)) {
      const error = computer.getParseErrorForElement(
        (node as ElementWithId).id
      );
      if (error) {
        return [
          {
            [DECORATE_SYNTAX_ERROR]: true,
            error: error.error,
            variant: 'custom',
            anchor: getStartPoint(editor, path),
            focus: getEndPoint(editor, path),
          },
        ];
      }
    }
    return undefined;
  };
