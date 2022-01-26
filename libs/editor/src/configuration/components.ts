import { ImportDataElement } from '@decipad/ui';
import {
  ElementKind,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_FETCH,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TABLE_INPUT,
  ELEMENT_UL,
} from '../elements';
import {
  MarkKind,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '../marks';
import {
  CodeLine,
  CodeBlock,
  SlashCommandsParagraph,
  Table,
  OrderedList,
  ListItem,
  UnorderedList,
  Title,
  Blockquote,
  Heading1,
  Heading2,
  Bold,
  Strikethrough,
  Underline,
  Italic,
  Code,
  Link,
} from '../components';
import { withStyledDraggables } from '../utils/withStyledDraggables';
import { PlateComponent } from '../types';

export type PlateComponents = Partial<
  Record<ElementKind | MarkKind, PlateComponent>
>;

export const components: PlateComponents = withStyledDraggables({
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

  // Inline
  [ELEMENT_LINK]: Link,

  // Special elements
  [ELEMENT_FETCH]: ImportDataElement as PlateComponent, // TODO kill/rewrite with editor/UI separation
  [ELEMENT_TABLE_INPUT]: Table,

  // Marks
  [MARK_BOLD]: Bold,
  [MARK_UNDERLINE]: Underline,
  [MARK_STRIKETHROUGH]: Strikethrough,
  [MARK_ITALIC]: Italic,
  [MARK_CODE]: Code,
} as PlateComponents);
