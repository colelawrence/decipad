import type { Computer } from '@decipad/computer-interfaces';
import {
  Blockquote,
  Bold,
  Callout,
  Code,
  Display,
  Divider,
  Heading1,
  Heading2,
  Highlight,
  IframeEmbed,
  Image,
  InteractiveParagraph,
  Italic,
  Link,
  ListItem,
  ListItemContent,
  MediaEmbed,
  OrderedList,
  Strikethrough,
  SubmitForm,
  Title,
  Underline,
  UnorderedList,
} from '@decipad/editor-components';
import type {
  ElementKind,
  MarkKind,
  PlateComponent,
} from '@decipad/editor-types';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CALLOUT,
  ELEMENT_DISPLAY,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_HR,
  ELEMENT_IFRAME,
  ELEMENT_IMAGE,
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_LINK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_SUBMIT_FORM,
  ELEMENT_UL,
  MARK_BOLD,
  MARK_CODE,
  MARK_HIGHLIGHT,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@decipad/editor-types';

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
  [ELEMENT_IFRAME]: IframeEmbed,

  // Submit
  [ELEMENT_SUBMIT_FORM]: SubmitForm,

  // Lists
  [ELEMENT_UL]: UnorderedList,
  [ELEMENT_OL]: OrderedList,
  [ELEMENT_LI]: ListItem,
  [ELEMENT_LIC]: ListItemContent,

  // Inlines
  [ELEMENT_LINK]: Link,

  [ELEMENT_DISPLAY]: Display,

  // Marks
  [MARK_BOLD]: Bold,
  [MARK_UNDERLINE]: Underline,
  [MARK_STRIKETHROUGH]: Strikethrough,
  [MARK_ITALIC]: Italic,
  [MARK_CODE]: Code,
  [MARK_HIGHLIGHT]: Highlight,
});
