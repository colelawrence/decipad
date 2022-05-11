import { getText, TDescendant, Decorate } from '@udecode/plate';
import { DECORATE_CODE_VARIABLE, Element } from '@decipad/editor-types';
import { NodeEntry, Range } from 'slate';
import { Computer } from '@decipad/computer';
import { getVariableRanges } from './getVariableRanges';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';

export const decorateTextSyntax =
  (computer: Computer, elementType: Element['type']): Decorate =>
  (editor) => {
    const syntaxErrorDecorations = ([
      node,
      path,
    ]: NodeEntry<TDescendant>): Range[] => {
      const lineResult = computer.results.getValue().blockResults[node.id];
      if (!lineResult) {
        return [];
      }
      return getSyntaxErrorRanges(path, lineResult);
    };

    const variableDecorations = ([
      node,
      path,
    ]: NodeEntry<TDescendant>): Range[] => {
      return getVariableRanges(getText(editor, path), path, node.id).map(
        (range) => ({
          ...range,
          [DECORATE_CODE_VARIABLE]: true,
        })
      );
    };

    return (entry: NodeEntry<TDescendant>) => {
      const [node] = entry;
      if (node.type !== elementType) {
        return [];
      }

      const decorations = syntaxErrorDecorations(entry).concat(
        variableDecorations(entry)
      );

      return decorations;
    };
  };
