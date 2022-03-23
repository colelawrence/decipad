import {
  ElementKind,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  MarkKind,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  PlateComponent,
} from '@decipad/editor-types';
import {
  Blockquote,
  Bold,
  Code,
  CodeBlock,
  CodeLine,
  Heading1,
  Heading2,
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

export type PlateComponents = Partial<
  Record<ElementKind | MarkKind, PlateComponent>
>;

export const components: PlateComponents = {
  // Headings
  [ELEMENT_H1]: Title,
  [ELEMENT_H2]: Heading1,
  [ELEMENT_H3]: Heading2,

  // Text blocks
  [ELEMENT_PARAGRAPH]: SlashCommandsParagraph,
  [ELEMENT_BLOCKQUOTE]: Blockquote,

  // Code
  [ELEMENT_CODE_BLOCK]: CodeBlock,
  [ELEMENT_CODE_LINE]: CodeLine,

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
};
