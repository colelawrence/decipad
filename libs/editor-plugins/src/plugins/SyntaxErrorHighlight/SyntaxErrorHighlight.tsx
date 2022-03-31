import { createPluginFactory } from '@udecode/plate';
import { CodeErrorHighlight } from '@decipad/editor-components';
import { DECORATE_SYNTAX_ERROR } from '../../constants';

export const createSyntaxErrorHighlightPlugin = createPluginFactory({
  key: DECORATE_SYNTAX_ERROR,
  isLeaf: true,
  component: (props) => (
    <CodeErrorHighlight {...props} variant={props.leaf.variant} />
  ),
});
