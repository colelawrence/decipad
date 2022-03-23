import { createPluginFactory } from '@udecode/plate';
import { ELEMENT_LINK } from '@decipad/editor-types';
import { Link } from '@decipad/editor-components';

export const createLinkPlugin = createPluginFactory({
  key: ELEMENT_LINK,
  isElement: true,
  isInline: true,
  component: Link,
});
