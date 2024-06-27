import { SerializedType } from '@decipad/language-interfaces';
import { colorSchemes } from 'libs/ui/src/primitives';
import { ChartStyleOption, ColorSchemeUniqueName } from './types';

export const optionsForChartStyle = (
  type: 'bar' | 'line' | 'arc'
): ChartStyleOption[] => {
  return type === 'line'
    ? [
        {
          key: 'simple',
          type,
          label: 'Simple',
        },
        {
          key: 'area',
          type,
          label: 'Area',
        },
        { key: 'area100', type, label: 'Area 100%' },
      ]
    : type === 'arc'
    ? [
        { key: 'simple', type, label: 'Simple' },
        { key: 'donut', type, label: 'Donut' },
      ]
    : [
        { key: 'grouped', type, label: 'Grouped' },
        { key: 'stacked', type, label: 'Stacked' },
        { key: 'stacked100', type, label: 'Stacked 100%' },
      ];
};

export const getColorSchemePrettyName = (uniqueName: ColorSchemeUniqueName) => {
  const cs = colorSchemes[uniqueName];
  // When this function is called we cheat and coerce a string to `ColorSchemeUniqueName` so we
  // have to check whether cs exists even though the type system thinks it definitely should!
  return cs ? `${cs.category} ${cs.name}` : '';
};

export function getInitialAxes(
  columns: readonly string[],
  types: readonly SerializedType[],
  isScatter: boolean
): { initialX: string; initialY: string } {
  let initialX = '';
  let initialY = '';

  if (isScatter) {
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const type = types[i];

      if (!initialX && type.kind === 'number') {
        initialX = column;
      } else if (!initialY && type.kind === 'number') {
        initialY = column;
      }

      if (initialX && initialY) {
        break;
      }
    }
  } else {
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const type = types[i];

      if (!initialX && (type.kind === 'string' || type.kind === 'date')) {
        initialX = column;
      }

      if (!initialY && type.kind === 'number') {
        initialY = column;
      }

      if (initialX && initialY) {
        break;
      }
    }
  }

  return {
    initialX: initialX || columns[0],
    initialY: initialY || (columns.length > 1 ? columns[1] : columns[0]),
  };
}
