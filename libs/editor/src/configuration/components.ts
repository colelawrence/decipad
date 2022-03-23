import { types } from '@decipad/editor-config';
import {
  ElementKind,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_COLUMNS,
  ELEMENT_FETCH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_INPUT,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_PLOT,
  ELEMENT_TABLE_INPUT,
  ELEMENT_UL,
  MarkKind,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@decipad/editor-types';
import { ImportDataElement } from '@decipad/ui';
import {
  Blockquote,
  Bold,
  Code,
  CodeBlock,
  CodeLine,
  Columns,
  Heading1,
  Heading2,
  Input,
  Italic,
  Link,
  ListItem,
  ListItemContent,
  OrderedList,
  Plot,
  SlashCommandsParagraph,
  Strikethrough,
  Table,
  Title,
  Underline,
  UnorderedList,
} from '../plate-components';

export type PlateComponents = Partial<
  Record<ElementKind | MarkKind, types.PlateComponent>
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

  // Inline
  [ELEMENT_LINK]: Link,

  // Layout
  [ELEMENT_COLUMNS]: Columns,

  // Special elements
  [ELEMENT_FETCH]: ImportDataElement as types.PlateComponent, // TODO kill/rewrite with editor/UI separation
  [ELEMENT_TABLE_INPUT]: Table,
  [ELEMENT_INPUT]: Input,
  [ELEMENT_PLOT]: Plot,
  [ELEMENT_INPUT]: Input,

  // Marks
  [MARK_BOLD]: Bold,
  [MARK_UNDERLINE]: Underline,
  [MARK_STRIKETHROUGH]: Strikethrough,
  [MARK_ITALIC]: Italic,
  [MARK_CODE]: Code,
};
