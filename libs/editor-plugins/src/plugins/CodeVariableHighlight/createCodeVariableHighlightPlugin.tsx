import { CodeVariable } from '@decipad/editor-components';
import { createTPluginFactory } from '@decipad/editor-types';
import { DECORATE_CODE_VARIABLE } from '../../constants';

export const createCodeVariableHighlightPlugin = createTPluginFactory({
  key: DECORATE_CODE_VARIABLE,
  isLeaf: true,
  // isElement: true,

  component: (props) => {
    return <CodeVariable {...props} />;
  },
});
