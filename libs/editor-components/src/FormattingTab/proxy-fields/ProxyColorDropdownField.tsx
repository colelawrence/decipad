import { ProxyDropdownField } from './ProxyDropdownField';
import { colorSwatches } from '@decipad/ui';
import { ProxyFieldProps } from './types';
import { Palette, RainbowPalette, RedGreenPalette } from 'libs/ui/src/icons';

export type ColorSwatch = keyof typeof colorSwatches;
export type ColorOption = ColorSwatch | 'auto';
export type ColorOptionWithTrend = ColorOption | 'trend';

const colorNames: Record<ColorOptionWithTrend, string> = {
  trend: 'Red/green',
  auto: 'Notebook theme',
  Catskill: 'Gray',
  Sulu: 'Green',
  Sun: 'Yellow',
  Grapefruit: 'Orange',
  Rose: 'Red',
  Perfume: 'Purple',
  Malibu: 'Blue',
};

const options: ColorOption[] = [
  'auto',
  ...(Object.keys(colorSwatches) as ColorSwatch[]),
];

const optionsWithTrend: ColorOptionWithTrend[] = ['trend', ...options];

const paletteIcon = (color: ColorOptionWithTrend) => {
  if (color === 'auto') {
    return <RainbowPalette css={{ height: '8px' }} />;
  }

  if (color === 'trend') {
    return <RedGreenPalette css={{ height: '8px' }} />;
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
}: ProxyFieldProps<ColorOption>) => (
  <ProxyDropdownField<ColorOption>
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

export const ProxyTrendColorDropdownField = ({
  editor,
  label,
  property,
  onChange,
}: ProxyFieldProps<ColorOptionWithTrend>) => (
  <ProxyDropdownField<ColorOptionWithTrend>
    editor={editor}
    label={label}
    property={property}
    options={optionsWithTrend}
    labelForValue={(color) => colorNames[color]}
    iconForValue={paletteIcon}
    variesIcon={paletteIcon('auto')}
    squareIcon={false}
    onChange={onChange}
  />
);
