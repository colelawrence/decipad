import { OneResult } from '../result';
import { Value } from './types';

export const valueToResultValue = async (value: Value): Promise<OneResult> =>
  value.getData();
