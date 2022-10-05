import { MagicNumber } from '@decipad/editor-components';
import { createTPluginFactory, MARK_MAGICNUMBER } from '@decipad/editor-types';
import { withMagicNumberOverrides } from './withMagicNumberOverrides';
import {
  createMagicCursorKeysPlugin,
  createMagicNumberCursorPlugin,
  createNormalizeMagicNumbersPlugin,
} from './plugins';

export const createMagicNumberPlugin = createTPluginFactory({
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
