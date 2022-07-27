import { createLinkPlugin as _createLinkPlugin } from '@udecode/plate';
import { molecules } from '@decipad/ui';

export const createLinkPlugin = () =>
  _createLinkPlugin({
    renderAfterEditable: molecules.FloatingLink,
  });
