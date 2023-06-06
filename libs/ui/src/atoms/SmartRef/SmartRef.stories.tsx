import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { SmartRef } from './SmartRef';

export default {
  title: 'Atoms / Editor / Bubble / Smart Ref',
  component: SmartRef,
  decorators: [
    (St) => (
      <code style={{ margin: '5px' }}>
        <St /> + 100
      </code>
    ),
  ],
} as Meta;

export const Normal: Story<ComponentProps<typeof SmartRef>> = (props) => (
  <SmartRef symbolName={'Ounces'} {...props} />
);

export const NotInitialised: Story<ComponentProps<typeof SmartRef>> = () => (
  <SmartRef isInitialized={false} />
);

export const Column: Story<ComponentProps<typeof SmartRef>> = () => (
  <SmartRef symbolName={'People.Salary'} isInitialized />
);

export const ColumnSelected: Story<ComponentProps<typeof SmartRef>> = () => (
  <SmartRef symbolName={'People.Salary'} isInitialized isSelected />
);
