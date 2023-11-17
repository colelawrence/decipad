import { createTitleNormalizer } from './titleNormalizer';
import { createStructureNormalizer } from './structureNormalizer';
import { createInlineNumberPlugin } from './inlineNumber';
import { createSmartRefPlugin } from './smartRef';
import { createTabNormalizer } from './createTabNormalizer';
import { createInlineLinks } from './inlineLinks';

export const getMirrorEditorNormalizers = () => [
  createInlineNumberPlugin(),
  createInlineLinks(),
  createSmartRefPlugin(),
  createTabNormalizer(),
  createTitleNormalizer(),
  createStructureNormalizer(),
];
