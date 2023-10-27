import { MagicNumber } from '@decipad/editor-components';
import {
  createTPluginFactory,
  MARK_MAGICNUMBER,
  MyEditor,
  MyValue,
} from '@decipad/editor-types';
import { withMagicNumberOverrides } from './withMagicNumberOverrides';
import {
  createMagicCursorKeysPlugin,
  createMagicNumberCursorPlugin,
  createNormalizeMagicNumbersPlugin,
} from './plugins';

export const createMagicNumberPlugin = createTPluginFactory<
  object,
  MyValue,
  MyEditor
>({
  key: MARK_MAGICNUMBER,
  type: MARK_MAGICNUMBER,
  isInline: true,
  isVoid: true,
  isLeaf: true,
  withOverrides: withMagicNumberOverrides,
  component: MagicNumber,
  plugins: [
    createNormalizeMagicNumbersPlugin(),
    createMagicNumberCursorPlugin(),
    createMagicCursorKeysPlugin(),
  ],
});
