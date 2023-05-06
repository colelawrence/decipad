import { scheme } from 'vega';
import { once } from 'ramda';
import { colorSchemes } from '@decipad/ui';

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
