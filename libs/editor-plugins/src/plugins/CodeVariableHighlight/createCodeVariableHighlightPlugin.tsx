import { createPluginFactory } from '@udecode/plate';
import { CodeVariable } from '@decipad/editor-components';
import { DECORATE_CODE_VARIABLE } from '../../constants';

export const createCodeVariableHighlightPlugin = createPluginFactory({
  key: DECORATE_CODE_VARIABLE,
  isLeaf: true,
  // isElement: true,

  component: (props) => {
    return <CodeVariable {...props} />;
  },
});
