// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';

export const secondArgIsPercentage = (types?: Type[]) =>
  types?.[0].numberFormat == null && types?.[1].numberFormat === 'percentage';
