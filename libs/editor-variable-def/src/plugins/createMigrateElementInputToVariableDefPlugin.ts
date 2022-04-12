import { createNormalizerPluginFactory } from '@decipad/editor-plugins';
import { ELEMENT_INPUT, InputElement } from '@decipad/editor-types';
import { Editor, NodeEntry, Transforms } from 'slate';
import { inputElementToVariableDef } from '../utils/inputElementToVariableDef';

const normalize =
  (editor: Editor) =>
  ([node, path]: NodeEntry): boolean => {
    const replacement = inputElementToVariableDef(node as InputElement);
    Transforms.delete(editor, { at: path });
    Transforms.insertNodes(editor, replacement, { at: path });
    return true;
  };

export const createMigrateElementInputToVariableDefPlugin =
  createNormalizerPluginFactory({
    name: 'MIGRATE_ELEMENT_INPUT_TO_VARIABLE_DEF_PLUGIN',
    elementType: ELEMENT_INPUT,
    plugin: normalize,
  });
