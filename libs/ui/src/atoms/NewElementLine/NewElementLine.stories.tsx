import { Meta, Story } from '@storybook/react';
import { noop } from 'lodash';
import { NewElementLine } from './NewElementLine';

interface Args {}

export default {
  title: 'Atoms / UI / New Element Item',
  component: NewElementLine,
  args: {},
} as Meta<Args>;

export const Normal: Story<Args> = () => (
  <>
    <p>Hover under me</p>
    <NewElementLine onAdd={noop} show={true} />
  </>
);
