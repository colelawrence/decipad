import { CodeBlock } from '@decipad/ui';
import {
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_IMAGE,
  ELEMENT_PARAGRAPH,
  ImageElement,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  SlatePluginComponent,
  withProps,
} from '@udecode/slate-plugins';
import { Blockquote } from '../components/Blocks/Blockquote/Blockquote.component';
import { Paragraph } from '../components/Blocks/Paragraph/Paragraph.component';
import { Subheading } from '../components/Blocks/Subheading/Subheading.component';
import { Subtitle } from '../components/Blocks/Subtitle/Subtitle.component';
import { Title } from '../components/Blocks/Title/Title.component';
import { Bold } from '../components/Leafs/Bold/Bold.component';
import { Italic } from '../components/Leafs/Italic/Italic.component';
import { Strikethrough } from '../components/Leafs/Strikethrough/Strikethrough.component';
import { Underline } from '../components/Leafs/Underline/Underline.component';
import { withStyledDraggables } from '../utils/withStyledDraggables';
import { withStyledPlaceHolders } from '../utils/withStyledPlaceholders';

export * from './plugins';
export { components };

let components = createSlatePluginsComponents({
  [ELEMENT_H1]: Title,
  [ELEMENT_H2]: Subtitle,
  [ELEMENT_H3]: Subheading,
  [ELEMENT_PARAGRAPH]: Paragraph,
  [ELEMENT_BLOCKQUOTE]: Blockquote,
  [ELEMENT_IMAGE]: withProps(ImageElement, {
    as: 'img',
    styles: {
      root: {
        width: '100%',
      },
    },
  }),
  [ELEMENT_CODE_BLOCK]: CodeBlock as unknown as SlatePluginComponent,
  [MARK_BOLD]: Bold,
  [MARK_ITALIC]: Italic,
  [MARK_UNDERLINE]: Underline,
  [MARK_STRIKETHROUGH]: Strikethrough,
});

components = withStyledPlaceHolders(components);
components = withStyledDraggables(components);

export const options = createSlatePluginsOptions();
