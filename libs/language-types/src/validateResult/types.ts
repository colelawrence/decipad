import type { Result, SerializedType } from '@decipad/language-interfaces';

export type Validate = <T extends Result.OneResult | null | undefined>(
  type: SerializedType,
  value: T
) => Result.OneResult | null | undefined;
