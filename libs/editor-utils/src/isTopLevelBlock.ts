import { MyElement } from '@decipad/editor-types';
import { Path } from 'slate';

export const isTopLevelBlock = (_el: MyElement, path: Path) =>
  path.length === 1;
