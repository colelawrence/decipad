/* eslint-disable no-param-reassign */
import {
  ELEMENT_FETCH,
  ELEMENT_IMPORT,
  ELEMENT_INPUT,
  ELEMENT_PLOT,
  ELEMENT_TABLE_INPUT,
  MyEditor,
  MyElement,
  MyNodeEntry,
  MyText,
} from '@decipad/editor-types';
import { deleteText, getNodeChildren, isElement, isText } from '@udecode/plate';
import { Path } from 'slate';
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
  [ELEMENT_IMPORT]: ['url', 'source'],
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
  editor: MyEditor,
  entry: MyNodeEntry,
  node: MyElement
): boolean => {
  return normalizeExcessProperties(
    editor,
    entry,
    VOID_TYPE_PROPERTIES[node.type as keyof typeof VOID_TYPE_PROPERTIES]
  );
};

const removeBadChildren = (editor: MyEditor, path: Path): boolean => {
  for (const childEntry of getNodeChildren(editor, path)) {
    const [childNode, childPath] = childEntry;

    if (
      isElement(childNode) ||
      (isText(childNode) && (childNode as MyText).text !== '')
    ) {
      deleteText(editor, { at: childPath });
      return true;
    }
  }
  return false;
};

const addMissingProperties = (
  editor: MyEditor,
  entry: MyNodeEntry,
  node: MyElement
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
  (editor: MyEditor) =>
  (entry: MyNodeEntry): boolean => {
    const [node, path] = entry;

    if (
      isElement(node) &&
      Object.keys(VOID_TYPE_PROPERTIES).includes(node.type)
    ) {
      if (
        removeExcessProperties(editor, entry, node as MyElement) ||
        removeBadChildren(editor, path) ||
        addMissingProperties(editor, entry, node as MyElement)
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
