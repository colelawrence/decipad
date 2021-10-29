import {
  DefaultPlatePluginKey,
  ELEMENT_H1,
  PlatePluginComponent,
  withPlaceholders,
} from '@udecode/plate';

export const withStyledPlaceHolders = (
  components: Partial<Record<DefaultPlatePluginKey, PlatePluginComponent>>
): Partial<Record<DefaultPlatePluginKey, PlatePluginComponent>> =>
  withPlaceholders(components, [
    {
      key: ELEMENT_H1,
      placeholder: 'Untitled',
      hideOnBlur: false,
    },
  ]);
