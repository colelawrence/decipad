import { SlatePlugin } from '@udecode/slate-plugins';
import { RenderLeafProps } from 'slate-react';
import { BubbleLeaf } from './BubbleLeaf.component';
import { renderBubble } from './renderBubbles';

export const createBubblePlugin = (): SlatePlugin => ({
  renderLeaf: () => (props: RenderLeafProps) => <BubbleLeaf {...props} />,
  decorate: renderBubble,
});
