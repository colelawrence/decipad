import {
  createMyPluginFactory,
  DECORATE_TYPE_ERROR,
} from '@decipad/editor-types';
import { TypeErrorHighlight } from './TypeErrorHighlight';

export const createTypeErrorHighlightPlugin = createMyPluginFactory({
  key: DECORATE_TYPE_ERROR,
  isLeaf: true,
  component: (props) => (
    <TypeErrorHighlight {...props} error={props.leaf.error} />
  ),
});
