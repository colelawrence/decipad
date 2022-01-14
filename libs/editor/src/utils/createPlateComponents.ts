import { ImportDataElement } from '@decipad/ui';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
  ELEMENT_LINK,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate';
import { withStyledDraggables } from './withStyledDraggables';
import * as elementTypes from './elementTypes';
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
import type { PlateComponent } from './components';

export type PlateComponents = Partial<
  Record<elementTypes.ElementType, PlateComponent>
>;

// This function creates the editor components
export const createPlateComponents = (): PlateComponents => {
  const components: Partial<Record<elementTypes.ElementType, PlateComponent>> =
    {
      // Plate default elements
      [ELEMENT_PARAGRAPH]: SlashCommandsParagraph,
      [ELEMENT_H1]: Title,
      [ELEMENT_H2]: Heading1,
      [ELEMENT_H3]: Heading2,
      [ELEMENT_BLOCKQUOTE]: Blockquote,
      [ELEMENT_CODE_BLOCK]: CodeBlock,
      [ELEMENT_CODE_LINE]: CodeLine,

      [ELEMENT_UL]: UnorderedList,
      [ELEMENT_OL]: OrderedList,
      [ELEMENT_LI]: ListItem,

      [ELEMENT_LINK]: Link,

      // Custom elements
      [elementTypes.ELEMENT_IMPORT_DATA]: ImportDataElement as PlateComponent, // TODO rewrite with editor/UI separation
      [elementTypes.ELEMENT_TABLE_INPUT]: Table,

      // Marks
      [MARK_BOLD]: Bold,
      [MARK_UNDERLINE]: Underline,
      [MARK_STRIKETHROUGH]: Strikethrough,
      [MARK_ITALIC]: Italic,
      [MARK_CODE]: Code,
    };

  return withStyledDraggables(components);
};
