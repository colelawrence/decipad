import type { OneResult } from '../Result';
import type { Value } from '../Value';

export const valueToResultValue = async (value: Value): Promise<OneResult> =>
  value.getData();
