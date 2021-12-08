import { ImportDataElement, ImportDataElementProps } from '@decipad/ui';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_UL,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  SPRenderElementProps,
  SPRenderLeafProps,
} from '@udecode/plate';
import { FunctionComponent } from 'react';
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
} from '../components';

type PlateElementComponent = FunctionComponent<
  SPRenderElementProps | SPRenderLeafProps | ImportDataElementProps
>;

// This function creates the editor components
export const createPlateComponents = (): Partial<
  Record<elementTypes.ElementType, PlateElementComponent>
> => {
  const components: Partial<
    Record<elementTypes.ElementType, PlateElementComponent>
  > = {
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

    // Custom elements
    [elementTypes.ELEMENT_IMPORT_DATA]: ImportDataElement,
    [elementTypes.TABLE_INPUT]: Table,

    // Marks
    [MARK_BOLD]: Bold,
    [MARK_UNDERLINE]: Underline,
    [MARK_STRIKETHROUGH]: Strikethrough,
    [MARK_ITALIC]: Italic,
    [MARK_CODE]: Code,
  };

  return withStyledDraggables(components);
};
