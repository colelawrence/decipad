import {
  BlockquoteElement,
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
  StyledElement,
  withProps,
  SlatePluginComponent,
} from '@udecode/slate-plugins';
import { CodeBlock } from '@decipad/ui';
import { withStyledPlaceHolders } from '../utils/withStyledPlaceholders';

export * from './plugins';
export { components };

let components = createSlatePluginsComponents({
  [ELEMENT_H1]: withProps(StyledElement, {
    as: 'h1',
    styles: {
      root: {
        fontSize: '2rem',
        margin: 0,
        paddingBottom: '2rem',
        marginBottom: '16px',
        borderBottom: '1px solid #f0f0f2',
        fontWeight: 'bold',
        color: '#121214',
      },
    },
  }),
  [ELEMENT_H2]: withProps(StyledElement, {
    as: 'h2',
    styles: {
      root: {
        fontSize: '24px',
        margin: 0,
        padding: '2rem 0 1rem 0',
        fontWeight: 'bold',
        color: '#121214',
      },
    },
  }),
  [ELEMENT_H3]: withProps(StyledElement, {
    as: 'h3',
    styles: {
      root: {
        fontSize: '20px',
        margin: 0,
        padding: '1rem 0 0.5rem 0',
        fontWeight: 'bold',
        color: '#121214',
      },
    },
  }),
  [ELEMENT_PARAGRAPH]: withProps(StyledElement, {
    as: 'p',
    styles: {
      root: {
        lineHeight: '1.75',
        color: '#3E3E42',
        padding: '8px 0',
        position: 'relative',
      },
    },
  }),
  [ELEMENT_BLOCKQUOTE]: withProps(BlockquoteElement, {
    as: 'div',
    styles: {
      root: {
        backgroundColor: '#BEE3F8',
        color: '#2B6CB0',
        lineHeight: '1.75',
        border: '1px solid #90CDF4',
        padding: '12px 24px',
        borderRadius: '8px',
        fontStyle: 'italic',
        fontSize: '16px',
        boxShadow: '0px 2px 24px -4px rgba(36, 36, 41, 0.06)',
      },
    },
  }),
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
