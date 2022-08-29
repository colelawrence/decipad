import { createTPluginFactory } from '@decipad/editor-types';
import { DECORATE_CODE_VARIABLE } from '../../constants';
import { CodeVariable } from './CodeVariable';

export const createCodeVariableHighlightPlugin = createTPluginFactory({
  key: DECORATE_CODE_VARIABLE,
  isLeaf: true,
  // isElement: true,

  component: (props) => {
    return <CodeVariable {...props} />;
  },
});
