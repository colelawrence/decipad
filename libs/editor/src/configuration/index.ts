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
  SlatePluginComponent,
  withProps,
} from '@udecode/slate-plugins';
import { Blockquote } from '../components/Blocks/Blockquote/Blockquote.component';
import { Paragraph } from '../components/Blocks/Paragraph/Paragraph.component';
import { Subheading } from '../components/Blocks/Subheading/Subheading.component';
import { Subtitle } from '../components/Blocks/Subtitle/Subtitle.component';
import { Title } from '../components/Blocks/Title/Title.component';
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
});

components = withStyledPlaceHolders(components);

export const options = createSlatePluginsOptions();
