import { Decorate, getText, PlatePlugin, TDescendant } from '@udecode/plate';
import { NodeEntry } from 'slate';
import { CodeVariable } from '../../components';
import { ELEMENT_CODE_LINE } from '../../elements';
import { getVariableRanges } from './getVariableRanges';

const IS_CODE_VARIABLE = 'IS_CODE_VARIABLE';

const decorate: Decorate =
  (editor) =>
  ([node, path]: NodeEntry<TDescendant>) => {
    if (node.type !== ELEMENT_CODE_LINE) {
      return [];
    }

    return getVariableRanges(getText(editor, path), path).map((range) => ({
      ...range,
      [IS_CODE_VARIABLE]: true,
    }));
  };

export const createCodeVariableHighlightingPlugin = (): PlatePlugin => ({
  pluginKeys: ELEMENT_CODE_LINE,
  decorate,
  renderLeaf: (_editor) => (props) => {
    return props.leaf[IS_CODE_VARIABLE] ? (
      <CodeVariable {...props} />
    ) : (
      props.children
    );
  },
});
