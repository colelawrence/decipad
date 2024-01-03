// eslint-disable-next-line no-restricted-imports
import { Result, SerializedType } from '@decipad/language-types';

export type Validate = <T extends Result.OneResult | null | undefined>(
  type: SerializedType,
  value: T
) => Result.OneResult | null | undefined;
