import { Meta, StoryFn } from '@storybook/react';

import { SyntaxErrorHighlight } from './SyntaxErrorHighlight';

export default {
  title: 'Molecules / Editor / Syntax / Error Highlight',
  component: SyntaxErrorHighlight,
} as Meta;

export const Normal: StoryFn = () => (
  <>
    <span>[1, 2,</span>
    <SyntaxErrorHighlight>,</SyntaxErrorHighlight>
    <span> 3]</span>
  </>
);

export const NeverOpened: StoryFn = () => (
  <>
    <span>[1, 2, 3]</span>
    <SyntaxErrorHighlight variant="never-opened">]</SyntaxErrorHighlight>
  </>
);

export const NeverClosed: StoryFn = () => (
  <>
    <SyntaxErrorHighlight variant="never-closed">[</SyntaxErrorHighlight>
    <span>[1, 2, 3]</span>
  </>
);

export const MismatchedBrackets: StoryFn = () => (
  <>
    <SyntaxErrorHighlight variant="mismatched-brackets">(</SyntaxErrorHighlight>
    <span>1, 2, 3</span>
    <SyntaxErrorHighlight variant="mismatched-brackets">]</SyntaxErrorHighlight>
  </>
);
