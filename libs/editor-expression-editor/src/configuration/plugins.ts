import { createSyntaxErrorHighlightPlugin } from '@decipad/editor-plugins';
import { createNormalizeCodeLinePlugin } from '../plugins';

export const plugins = [
  createNormalizeCodeLinePlugin(),
  createSyntaxErrorHighlightPlugin(),
];
