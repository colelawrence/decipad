import { Meta, Story } from '@storybook/react';

import { SyntaxErrorHighlight } from './SyntaxErrorHighlight';

export default {
  title: 'Molecules / Editor / Syntax / Error Highlight',
  component: SyntaxErrorHighlight,
} as Meta;

export const Normal: Story = () => (
  <>
    <span>[1, 2,</span>
    <SyntaxErrorHighlight>,</SyntaxErrorHighlight>
    <span> 3]</span>
  </>
);

export const NeverOpened: Story = () => (
  <>
    <span>[1, 2, 3]</span>
    <SyntaxErrorHighlight variant="never-opened">]</SyntaxErrorHighlight>
  </>
);

export const NeverClosed: Story = () => (
  <>
    <SyntaxErrorHighlight variant="never-closed">[</SyntaxErrorHighlight>
    <span>[1, 2, 3]</span>
  </>
);

export const MismatchedBrackets: Story = () => (
  <>
    <SyntaxErrorHighlight variant="mismatched-brackets">(</SyntaxErrorHighlight>
    <span>1, 2, 3</span>
    <SyntaxErrorHighlight variant="mismatched-brackets">]</SyntaxErrorHighlight>
  </>
);
