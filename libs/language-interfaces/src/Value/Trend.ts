import DeciNumber from '@decipad/number';
import { Value } from './Value';

export interface TrendValue extends Value {
  first: DeciNumber | undefined;
  last: DeciNumber | undefined;
  diff: DeciNumber | undefined;
}
