import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import {
  ELEMENT_INPUT,
  InputElement,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { deleteText, insertNodes } from '@udecode/plate';
import { inputElementToVariableDef } from '../utils/inputElementToVariableDef';

const normalize =
  (editor: MyEditor) =>
  ([node, path]: MyNodeEntry): boolean => {
    const replacement = inputElementToVariableDef(node as InputElement);
    deleteText(editor, { at: path });
    insertNodes(editor, replacement, { at: path });
    return true;
  };

export const createMigrateElementInputToVariableDefPlugin =
  createNormalizerPluginFactory({
    name: 'MIGRATE_ELEMENT_INPUT_TO_VARIABLE_DEF_PLUGIN',
    elementType: ELEMENT_INPUT,
    acceptableElementProperties: ['variableName', 'value'],
    plugin: normalize,
  });
