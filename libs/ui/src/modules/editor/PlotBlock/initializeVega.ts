import { scheme } from 'vega';
import { once } from '@decipad/utils';
import { colorSchemes } from '../../../primitives';

export const initializeVega = once(() => {
  Object.entries(colorSchemes).forEach(([uniqueName, cs]) => {
    scheme(
      `${uniqueName}_dark`,
      cs.dark_mode_colors.map((c) => c.hex)
    );
    scheme(
      `${uniqueName}_light`,
      cs.light_mode_colors.map((c) => c.hex)
    );
  });
});
