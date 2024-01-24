import {
  createMyPluginFactory,
  MARK_MAGICNUMBER,
  type MyEditor,
  type MyValue,
} from '@decipad/editor-types';

export const createMagicNumberPluginNoUI = createMyPluginFactory<
  object,
  MyValue,
  MyEditor
>({
  key: MARK_MAGICNUMBER,
  type: MARK_MAGICNUMBER,
  isInline: true,
  isVoid: true,
  isLeaf: true,
});
