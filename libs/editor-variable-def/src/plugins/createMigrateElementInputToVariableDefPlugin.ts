import { createNormalizerPluginFactory } from '@decipad/editor-plugin-factories';
import type {
  DeprecatedInputElement,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { DEPRECATED_ELEMENT_INPUT } from '@decipad/editor-types';
import { insertNodes } from '@decipad/editor-utils';
import { deleteText } from '@udecode/plate-common';
import { inputElementToVariableDef } from '../utils/inputElementToVariableDef';

const normalize =
  (editor: MyEditor) =>
  ([node, path]: MyNodeEntry): false | (() => void) => {
    const replacement = inputElementToVariableDef(
      node as DeprecatedInputElement
    );
    return () => {
      deleteText(editor, { at: path });
      insertNodes(editor, [replacement], { at: path });
    };
  };

export const createMigrateElementInputToVariableDefPlugin =
  createNormalizerPluginFactory({
    name: 'MIGRATE_ELEMENT_INPUT_TO_VARIABLE_DEF_PLUGIN',
    elementType: DEPRECATED_ELEMENT_INPUT,
    acceptableElementProperties: ['variableName', 'value'],
    plugin: normalize,
  });
