import { Meta, StoryFn } from '@storybook/react';
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

export const Normal: StoryFn<ComponentProps<typeof SmartRef>> = (props) => (
  <SmartRef symbolName={'Ounces'} {...props} />
);

export const NotInitialised: StoryFn<ComponentProps<typeof SmartRef>> = () => (
  <SmartRef isInitialized={false} />
);

export const Column: StoryFn<ComponentProps<typeof SmartRef>> = () => (
  <SmartRef symbolName={'People.Salary'} isInitialized />
);

export const ColumnSelected: StoryFn<ComponentProps<typeof SmartRef>> = () => (
  <SmartRef symbolName={'People.Salary'} isInitialized isSelected />
);
