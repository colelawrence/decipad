import { Computer } from '@decipad/computer';
import { isFlagEnabled } from '@decipad/feature-flags';
import { ELEMENT_EVAL, MyPlatePlugin } from '@decipad/editor-types';
import { EvalCodeArea } from './component';

export const evalPluginCore: MyPlatePlugin = {
  key: ELEMENT_EVAL,
  isElement: true,
  component: EvalCodeArea,
};

export const createEvalPlugin = (_computer: Computer): MyPlatePlugin[] =>
  !isFlagEnabled('UNSAFE_JS_EVAL') ? [] : [evalPluginCore];
