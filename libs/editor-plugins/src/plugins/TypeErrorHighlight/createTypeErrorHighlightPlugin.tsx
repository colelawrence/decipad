import {
  createTPluginFactory,
  DECORATE_TYPE_ERROR,
} from '@decipad/editor-types';
import { TypeErrorHighlight } from './TypeErrorHighlight';

export const createTypeErrorHighlightPlugin = createTPluginFactory({
  key: DECORATE_TYPE_ERROR,
  isLeaf: true,
  component: (props) => (
    <TypeErrorHighlight {...props} error={props.leaf.error} />
  ),
});
