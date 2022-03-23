import { getText, PlatePlugin, TDescendant } from '@udecode/plate';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { CodeLine } from '@decipad/editor-components';
import { NodeEntry, Range } from 'slate';
import { Computer } from '@decipad/language';
import { DECORATE_CODE_VARIABLE } from '../../constants';
import { getVariableRanges } from './getVariableRanges';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';

export const createCodeLinePlugin = (computer: Computer): PlatePlugin => ({
  key: ELEMENT_CODE_LINE,
  isElement: true,
  component: CodeLine,
  decorate: (editor) => {
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
      const names = computer
        .getNamesDefinedBefore([node.id, 0], false)
        .map((n) => n.name);

      return getVariableRanges(
        getText(editor, path),
        path,
        new Set(names || [])
      ).map((range: Range) => ({
        ...range,
        [DECORATE_CODE_VARIABLE]: true,
      }));
    };

    return (entry: NodeEntry<TDescendant>) => {
      const [node] = entry;
      if (node.type !== ELEMENT_CODE_LINE) {
        return [];
      }

      return syntaxErrorDecorations(entry).concat(variableDecorations(entry));
    };
  },
});
