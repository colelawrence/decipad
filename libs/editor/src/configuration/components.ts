import {
  ElementKind,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_HR,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  MarkKind,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_HIGHLIGHT,
  MARK_UNDERLINE,
  PlateComponent,
} from '@decipad/editor-types';
import {
  Blockquote,
  Bold,
  Callout,
  Code,
  Divider,
  Heading1,
  Heading2,
  Highlight,
  Italic,
  ListItem,
  ListItemContent,
  OrderedList,
  SlashCommandsParagraph,
  Strikethrough,
  Title,
  Underline,
  UnorderedList,
} from '@decipad/editor-components';
import { Computer } from '@decipad/computer';

export type PlateComponents = Partial<
  Record<ElementKind | MarkKind, PlateComponent>
>;

export const components = (computer: Computer): PlateComponents => ({
  // Headings
  [ELEMENT_H1]: Title,
  [ELEMENT_H2]: Heading1,
  [ELEMENT_H3]: Heading2,

  // Text blocks
  [ELEMENT_PARAGRAPH]: SlashCommandsParagraph(computer),
  [ELEMENT_BLOCKQUOTE]: Blockquote,
  [ELEMENT_CALLOUT]: Callout,
  [ELEMENT_HR]: Divider,

  // Lists
  [ELEMENT_UL]: UnorderedList,
  [ELEMENT_OL]: OrderedList,
  [ELEMENT_LI]: ListItem,
  [ELEMENT_LIC]: ListItemContent,

  // Marks
  [MARK_BOLD]: Bold,
  [MARK_UNDERLINE]: Underline,
  [MARK_STRIKETHROUGH]: Strikethrough,
  [MARK_ITALIC]: Italic,
  [MARK_CODE]: Code,
  [MARK_HIGHLIGHT]: Highlight,
});
