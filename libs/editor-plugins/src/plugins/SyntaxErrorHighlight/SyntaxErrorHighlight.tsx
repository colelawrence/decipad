import { CodeErrorHighlight } from '@decipad/editor-components';
import {
  createTPluginFactory,
  DECORATE_SYNTAX_ERROR,
} from '@decipad/editor-types';

export const createSyntaxErrorHighlightPlugin = createTPluginFactory({
  key: DECORATE_SYNTAX_ERROR,
  isLeaf: true,
  component: (props) => (
    <CodeErrorHighlight {...props} variant={props.leaf.variant} />
  ),
});
