import { createTPluginFactory, ELEMENT_LINK } from '@decipad/editor-types';
import { Link } from '@decipad/editor-components';

export const createLinkPlugin = createTPluginFactory({
  key: ELEMENT_LINK,
  isElement: true,
  isInline: true,
  component: Link,
});
