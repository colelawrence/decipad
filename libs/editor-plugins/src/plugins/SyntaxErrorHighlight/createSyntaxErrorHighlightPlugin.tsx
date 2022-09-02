import {
  createTPluginFactory,
  DECORATE_SYNTAX_ERROR,
} from '@decipad/editor-types';
import { SyntaxErrorHighlight } from './SyntaxErrorHighlight';

export const createSyntaxErrorHighlightPlugin = createTPluginFactory({
  key: DECORATE_SYNTAX_ERROR,
  isLeaf: true,
  component: (props) => (
    <SyntaxErrorHighlight
      {...props}
      variant={props.leaf.variant}
      error={props.leaf.error}
    />
  ),
});
