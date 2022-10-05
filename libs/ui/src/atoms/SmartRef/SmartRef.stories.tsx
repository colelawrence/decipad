import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { SmartRef } from './SmartRef';

export default {
  title: 'Atoms / Editor / Bubble / Smart Ref',
  component: SmartRef,
  decorators: [
    (St) => (
      <div style={{ margin: '5px' }}>
        We need 500g (or <St /> in 🇺🇸) of butter for this recipe.
      </div>
    ),
  ],
} as Meta;

export const Normal: Story<ComponentProps<typeof SmartRef>> = (props) => (
  <SmartRef {...props} />
);
