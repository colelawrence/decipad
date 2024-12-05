import { ELEMENT_DATA_TAB_CHILDREN } from '@decipad/editor-types';
import { createNormalizer } from './element-normalizer';

export const elementNormalizersDataTab = [
  createNormalizer(ELEMENT_DATA_TAB_CHILDREN),
];

export * from './to-plate-plugin';
