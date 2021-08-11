import {
  BlockquoteElement,
  BoldLeaf,
  CodeLeaf,
  ItalicLeaf,
  ModelBlockElement,
  ParagraphElement,
  StrikethroughLeaf,
  SubheadingElement,
  SubtitleElement,
  TitleElement,
  UnderlineLeaf,
} from '@decipad/ui';
import {
  DefaultPlatePluginKey,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_PARAGRAPH,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  PlatePluginComponent,
} from '@udecode/plate';
import { withStyledDraggables } from './withStyledDraggables';
import { withStyledPlaceHolders } from './withStyledPlaceholders';

// This function creates the editor components
export const createPlateComponents = () => {
  const components = {
    // Elements
    [ELEMENT_PARAGRAPH]: ParagraphElement,
    [ELEMENT_H1]: TitleElement,
    [ELEMENT_H2]: SubtitleElement,
    [ELEMENT_H3]: SubheadingElement,
    [ELEMENT_BLOCKQUOTE]: BlockquoteElement,
    [ELEMENT_CODE_BLOCK]: ModelBlockElement,

    // Marks
    [MARK_BOLD]: BoldLeaf,
    [MARK_UNDERLINE]: UnderlineLeaf,
    [MARK_STRIKETHROUGH]: StrikethroughLeaf,
    [MARK_ITALIC]: ItalicLeaf,
    [MARK_CODE]: CodeLeaf,
  };

  // returns the components with placeholders and the drag icon
  return withStyledPlaceHolders(
    withStyledDraggables(
      components as Record<DefaultPlatePluginKey, PlatePluginComponent>
    )
  );
};
