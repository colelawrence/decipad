import {
  BlockquoteElement,
  BoldLeaf,
  CodeLeaf,
  ImportDataElement,
  ImportDataElementProps,
  ItalicLeaf,
  ListItemElement,
  ModelBlockElement,
  ParagraphElement,
  StrikethroughLeaf,
  SubheadingElement,
  SubtitleElement,
  TitleElement,
  UnderlineLeaf,
  UnorderedListElement,
} from '@decipad/ui';
import {
  DefaultPlatePluginKey,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_LI,
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
import { Table } from '../components/Table/Table';
import * as elementTypes from './elementTypes';
import { withStyledDraggables } from './withStyledDraggables';
import { withStyledPlaceHolders } from './withStyledPlaceholders';

type PluginKey =
  | DefaultPlatePluginKey
  | typeof elementTypes[keyof typeof elementTypes];

type PluginComponent = FunctionComponent<
  SPRenderElementProps | SPRenderLeafProps | ImportDataElementProps
>;

// This function creates the editor components
export const createPlateComponents = (): Partial<
  Record<PluginKey, PluginComponent>
> => {
  const components: Partial<Record<PluginKey, PluginComponent>> = {
    // Plate default elements
    [ELEMENT_PARAGRAPH]: ParagraphElement,
    [ELEMENT_H1]: TitleElement,
    [ELEMENT_H2]: SubtitleElement,
    [ELEMENT_H3]: SubheadingElement,
    [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
    [ELEMENT_CODE_BLOCK]: ModelBlockElement,
    [ELEMENT_UL]: UnorderedListElement,
    [ELEMENT_LI]: ListItemElement,

    // Custom elements
    [elementTypes.ELEMENT_IMPORT_DATA]: ImportDataElement,
    [elementTypes.TABLE_INPUT]: Table,

    // Marks
    [MARK_BOLD]: BoldLeaf,
    [MARK_UNDERLINE]: UnderlineLeaf,
    [MARK_STRIKETHROUGH]: StrikethroughLeaf,
    [MARK_ITALIC]: ItalicLeaf,
    [MARK_CODE]: CodeLeaf,
  };

  // returns the components with placeholders and the drag icon
  return withStyledPlaceHolders(withStyledDraggables(components));
};
