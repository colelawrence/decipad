import {
  DefaultSlatePluginKey,
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  SlatePluginComponent,
  withPlaceholders,
} from '@udecode/slate-plugins';

export const withStyledPlaceHolders = (
  components: Record<DefaultSlatePluginKey, SlatePluginComponent>
) =>
  withPlaceholders(components, [
    {
      key: ELEMENT_PARAGRAPH,
      placeholder: 'Type a paragraph',
      hideOnBlur: true,
    },
    {
      key: ELEMENT_H1,
      placeholder: 'Untitled',
      hideOnBlur: false,
    },
  ]);
