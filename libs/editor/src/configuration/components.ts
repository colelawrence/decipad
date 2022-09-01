import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  ElementKind,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  MarkKind,
  PlateComponent,
} from '@decipad/editor-types';
import {
  Blockquote,
  Bold,
  Callout,
  Code,
  CodeLine,
  Divider,
  Heading1,
  Heading2,
  Highlight,
  Image,
  Italic,
  Link,
  ListItem,
  ListItemContent,
  MediaEmbed,
  OrderedList,
  InteractiveParagraph,
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
  [ELEMENT_PARAGRAPH]: InteractiveParagraph(computer),
  [ELEMENT_BLOCKQUOTE]: Blockquote,
  [ELEMENT_CALLOUT]: Callout,
  [ELEMENT_HR]: Divider,

  // Media
  [ELEMENT_IMAGE]: Image,
  [ELEMENT_MEDIA_EMBED]: MediaEmbed,

  // Code
  [ELEMENT_CODE_LINE]: CodeLine,

  // Lists
  [ELEMENT_UL]: UnorderedList,
  [ELEMENT_OL]: OrderedList,
  [ELEMENT_LI]: ListItem,
  [ELEMENT_LIC]: ListItemContent,

  // Inlines
  [ELEMENT_LINK]: Link,

  // Marks
  [MARK_BOLD]: Bold,
  [MARK_UNDERLINE]: Underline,
  [MARK_STRIKETHROUGH]: Strikethrough,
  [MARK_ITALIC]: Italic,
  [MARK_CODE]: Code,
  [MARK_HIGHLIGHT]: Highlight,
});
