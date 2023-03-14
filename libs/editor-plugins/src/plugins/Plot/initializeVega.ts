import { scheme } from 'vega';
import { colorSchemes } from '@decipad/ui';

export const initializeVega = () => {
  Object.entries(colorSchemes).forEach(([uniqueName, cs]) => {
    scheme(
      uniqueName,
      cs.colors.map((c) => c.rgb)
    );
  });
};
