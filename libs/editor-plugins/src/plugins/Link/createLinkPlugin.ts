import { createLinkPlugin } from '@udecode/plate';
import { molecules } from '@decipad/ui';

export const linkPlugin = createLinkPlugin({
  renderAfterEditable: molecules.FloatingLink,
});
