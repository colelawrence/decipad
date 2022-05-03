import { MagicNumber } from '@decipad/editor-components';
import { MARK_MAGICNUMBER } from '@decipad/editor-types';
import { createPluginFactory } from '@udecode/plate';
import { withMagicNumberOverrides } from './withMagicNumberOverrides';
import {
  createNormalizeMagicNumbersPlugin,
  createMagicNumberCursorPlugin,
  createMagicCursorKeysPlugin,
} from './plugins';

export const createMagicNumberPlugin = createPluginFactory({
  key: MARK_MAGICNUMBER,
  type: MARK_MAGICNUMBER,
  isInline: true,
  isVoid: true,
  isLeaf: true,
  withOverrides: withMagicNumberOverrides,
  component: (props) => {
    return <MagicNumber {...props} />;
  },
  plugins: [
    createNormalizeMagicNumbersPlugin(),
    createMagicNumberCursorPlugin(),
    createMagicCursorKeysPlugin(),
  ],
});
