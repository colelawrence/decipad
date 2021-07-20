import { Meta } from '@storybook/react';
import { Divider } from './Divider';

export default {
  title: 'Atoms / Divider',
  component: Divider,
} as Meta;

export const Normal = () => (
  <>
    (above)
    <Divider />
    (below)
  </>
);
