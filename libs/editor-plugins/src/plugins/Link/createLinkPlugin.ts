import { createLinkPlugin as _createLinkPlugin } from '@udecode/plate-link';
import { LinkFloatingToolbar } from '@decipad/editor-components';

export const createLinkPlugin = () =>
  _createLinkPlugin({
    renderAfterEditable: LinkFloatingToolbar,
  });
