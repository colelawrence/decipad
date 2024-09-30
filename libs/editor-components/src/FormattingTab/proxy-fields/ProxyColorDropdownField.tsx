import { ProxyDropdownField } from './ProxyDropdownField';
import { colorSwatches } from '@decipad/ui';
import { ProxyFieldProps } from './types';
import { Palette, RainbowPalette } from 'libs/ui/src/icons';

export type ColorSwatch = keyof typeof colorSwatches;
export type ColorSwatchOrAuto = ColorSwatch | 'auto';

const colorNames: Record<ColorSwatchOrAuto, string> = {
  auto: 'Notebook theme',
  Catskill: 'Gray',
  Sulu: 'Green',
  Sun: 'Yellow',
  Grapefruit: 'Orange',
  Rose: 'Red',
  Perfume: 'Purple',
  Malibu: 'Blue',
};

const options: ColorSwatchOrAuto[] = [
  'auto',
  ...(Object.keys(colorSwatches) as ColorSwatch[]),
];

const paletteIcon = (color: ColorSwatchOrAuto) => {
  if (color === 'auto') {
    return <RainbowPalette css={{ height: '8px ' }} />;
  }

  return (
    <Palette css={{ height: '8px' }} color={colorSwatches[color].vivid.hex} />
  );
};

export const ProxyColorDropdownField = ({
  editor,
  label,
  property,
  onChange,
}: ProxyFieldProps<ColorSwatchOrAuto>) => (
  <ProxyDropdownField<ColorSwatchOrAuto>
    editor={editor}
    label={label}
    property={property}
    options={options}
    labelForValue={(color) => colorNames[color]}
    iconForValue={paletteIcon}
    variesIcon={paletteIcon('auto')}
    squareIcon={false}
    onChange={onChange}
  />
);
