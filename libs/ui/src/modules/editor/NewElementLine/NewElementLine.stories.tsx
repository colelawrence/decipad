import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { NewElementLine } from './NewElementLine';

interface Args {}

export default {
  title: 'Atoms / UI / New Element Item',
  component: NewElementLine,
  args: {},
} as Meta<Args>;

export const Normal: StoryFn<Args> = () => (
  <>
    <p>Hover under me</p>
    <NewElementLine onAdd={noop} show={true} />
  </>
);
