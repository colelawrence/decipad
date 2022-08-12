import { Computer } from '@decipad/computer';
import { isEnabled } from '@decipad/feature-flags';
import { ELEMENT_EVAL, MyPlatePlugin } from '@decipad/editor-types';
import { EvalCodeArea } from '@decipad/editor-components';

export const evalPluginCore: MyPlatePlugin = {
  key: ELEMENT_EVAL,
  isElement: true,
  component: EvalCodeArea,
};

export const createEvalPlugin = (_computer: Computer): MyPlatePlugin[] =>
  !isEnabled('UNSAFE_JS_EVAL') ? [] : [evalPluginCore];
