import { getText, PlatePlugin, TDescendant } from '@udecode/plate';
import { NodeEntry, Range } from 'slate';
import { ELEMENT_CODE_LINE } from '@decipad/editor-types';
import { CodeVariable } from '../../plate-components';
import { getVariableRanges } from './getVariableRanges';

import { useComputer } from '../../contexts/Computer';

const IS_CODE_VARIABLE = 'IS_CODE_VARIABLE';

export const useCodeVariableHighlightingPlugin = (): PlatePlugin => {
  const computer = useComputer();

  return {
    pluginKeys: ELEMENT_CODE_LINE,
    decorate:
      (editor) =>
      ([node, path]: NodeEntry<TDescendant>) => {
        if (node.type !== ELEMENT_CODE_LINE) {
          return [];
        }

        const names = computer
          .getNamesDefinedBefore([node.id, 0], false)
          .map((n) => n.name);
        return getVariableRanges(
          getText(editor, path),
          path,
          new Set(names || [])
        ).map((range: Range) => ({
          ...range,
          [IS_CODE_VARIABLE]: true,
        }));
      },
    renderLeaf: (_editor) => (props) => {
      return props.leaf[IS_CODE_VARIABLE] ? (
        <CodeVariable {...props} />
      ) : (
        props.children
      );
    },
  };
};
