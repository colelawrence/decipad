import { Meta, Story } from '@storybook/react';

import { CodeSyntaxErrorHighlight } from './CodeSyntaxErrorHighlight';

export default {
  title: 'Molecules / Editor / Syntax / Error Highlight',
  component: CodeSyntaxErrorHighlight,
} as Meta;

export const Normal: Story = () => (
  <>
    <span>[1, 2,</span>
    <CodeSyntaxErrorHighlight>,</CodeSyntaxErrorHighlight>
    <span> 3]</span>
  </>
);

export const NeverOpened: Story = () => (
  <>
    <span>[1, 2, 3]</span>
    <CodeSyntaxErrorHighlight variant="never-opened">
      ]
    </CodeSyntaxErrorHighlight>
  </>
);

export const NeverClosed: Story = () => (
  <>
    <CodeSyntaxErrorHighlight variant="never-closed">
      [
    </CodeSyntaxErrorHighlight>
    <span>[1, 2, 3]</span>
  </>
);

export const MismatchedBrackets: Story = () => (
  <>
    <CodeSyntaxErrorHighlight variant="mismatched-brackets">
      (
    </CodeSyntaxErrorHighlight>
    <span>1, 2, 3</span>
    <CodeSyntaxErrorHighlight variant="mismatched-brackets">
      ]
    </CodeSyntaxErrorHighlight>
  </>
);
