import { createLinkPlugin as _createLinkPlugin } from '@udecode/plate';
import { FloatingLink } from '@decipad/ui';

export const createLinkPlugin = () =>
  _createLinkPlugin({
    renderAfterEditable: FloatingLink,
  });
