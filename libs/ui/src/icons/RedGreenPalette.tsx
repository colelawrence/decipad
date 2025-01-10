/* eslint decipad/css-prop-named-variable: 0 */
import type { SVGProps } from 'react';
import { colorSwatches } from '../utils';
import { FourColorPalette } from './FourColorPalette';

export const RedGreenPalette = (props: SVGProps<SVGSVGElement>) => {
  return (
    <FourColorPalette
      title="RedGreenPalette"
      colors={[
        colorSwatches.Rose.vivid.hex,
        colorSwatches.Rose.vivid.hex,
        colorSwatches.Sulu.vivid.hex,
        colorSwatches.Sulu.vivid.hex,
      ]}
      {...props}
    />
  );
};
