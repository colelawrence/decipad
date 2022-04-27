/* eslint-disable no-param-reassign */
import {
  ELEMENT_FETCH,
  ELEMENT_INPUT,
  ELEMENT_PLOT,
  ELEMENT_TABLE_INPUT,
  Element,
} from '@decipad/editor-types';
import { isElement, isText, TNode } from '@udecode/plate';
import { Editor, Node, NodeEntry, Path, Transforms } from 'slate';
import { createNormalizerPluginFactory } from '../../pluginFactories';
import {
  normalizeExcessProperties,
  normalizeMissingProperties,
} from '../../utils/normalize';

const VOID_TYPE_PROPERTIES = {
  [ELEMENT_TABLE_INPUT]: ['tableData'],
  [ELEMENT_FETCH]: [
    'data-auth-url',
    'data-contenttype',
    'data-error',
    'data-external-data-source-id',
    'data-external-id',
    'data-href',
    'data-provider',
    'data-varname',
  ],
  [ELEMENT_PLOT]: [
    'title',
    'colorScheme',
    'sourceVarName',
    'markType',
    'xColumnName',
    'yColumnName',
    'sizeColumnName',
    'colorColumnName',
    'thetaColumnName',
  ],
  [ELEMENT_INPUT]: ['value', 'variableName'],
};

const emptyString = () => '';

const MISSING_ATTRIBUTE_GENERATOR = {
  [ELEMENT_TABLE_INPUT]: {
    tableData: () => ({ variableName: 'table', columns: [] }), // legacy
  },
  [ELEMENT_FETCH]: {
    'data-auth-url': emptyString,
    'data-contenttype': emptyString,
    'data-error': emptyString,
    'data-external-data-source-id': emptyString,
    'data-external-id': emptyString,
    'data-href': emptyString,
    'data-provider': emptyString,
    'data-varname': emptyString,
  },
  [ELEMENT_PLOT]: {
    colorScheme: emptyString,
    sourceVarName: emptyString,
    markType: emptyString,
    xColumnName: emptyString,
    yColumnName: emptyString,
    sizeColumnName: emptyString,
    colorColumnName: emptyString,
    thetaColumnName: emptyString,
  },
  [ELEMENT_INPUT]: {
    value: emptyString,
    variableName: emptyString,
  },
};

const removeExcessProperties = (
  editor: Editor,
  entry: NodeEntry,
  node: Element
): boolean => {
  return normalizeExcessProperties(
    editor,
    entry,
    VOID_TYPE_PROPERTIES[node.type as keyof typeof VOID_TYPE_PROPERTIES]
  );
};

const removeBadChildren = (editor: Editor, path: Path): boolean => {
  for (const childEntry of Node.children(editor, path)) {
    const [childNode, childPath] = childEntry as NodeEntry<TNode>;

    if (isElement(childNode) || (isText(childNode) && childNode.text !== '')) {
      Transforms.delete(editor, { at: childPath });
      return true;
    }
  }
  return false;
};

const addMissingProperties = (
  editor: Editor,
  entry: NodeEntry,
  node: Element
): boolean => {
  return normalizeMissingProperties(
    editor,
    entry,
    VOID_TYPE_PROPERTIES[node.type as keyof typeof VOID_TYPE_PROPERTIES],
    MISSING_ATTRIBUTE_GENERATOR[
      node.type as keyof typeof MISSING_ATTRIBUTE_GENERATOR
    ]
  );
};

const normalizeVoid =
  (editor: Editor) =>
  (entry: NodeEntry): boolean => {
    const [node, path] = entry as NodeEntry<TNode>;

    if (Object.keys(VOID_TYPE_PROPERTIES).includes(node.type)) {
      if (
        removeExcessProperties(editor, entry, node as Element) ||
        removeBadChildren(editor, path) ||
        addMissingProperties(editor, entry, node as Element)
      ) {
        return true;
      }
    }

    return false;
  };

export const createNormalizeVoidPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_VOID_PLUGIN',
  plugin: normalizeVoid,
});
