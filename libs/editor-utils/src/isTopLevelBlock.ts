import type { MyElement, TopLevelValue } from '@decipad/editor-types';
import type { Path } from 'slate';

export const isTopLevelBlock = (
  _el: MyElement,
  path: Path
): _el is TopLevelValue => path.length === 1;
