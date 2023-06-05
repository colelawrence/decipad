import { Meta, Story } from '@storybook/react';
import { Code, Settings, Show } from '../../icons';
import { TextAndIconButton } from './TextAndIconButton';

export default {
  title: 'Atoms / UI / Buttons / With Icon',
  component: TextAndIconButton,
} as Meta;

export const Normal: Story<{ children: string }> = () => (
  <TextAndIconButton key="1" text={'Code'}>
    <Code />
  </TextAndIconButton>
);

export const Animated: Story<{ children: string }> = () => (
  <TextAndIconButton key="1" text={'Code'} animateIcon>
    <Code />
  </TextAndIconButton>
);

export const Lefty: Story<{ children: string }> = () => (
  <TextAndIconButton key="1" text={'Code'} iconPosition="left">
    <Code />
  </TextAndIconButton>
);

export const Transparent: Story<{ children: string }> = () => (
  <TextAndIconButton key="1" text={'Code'} color="transparent">
    <Code />
  </TextAndIconButton>
);

export const Everything: Story<{ children: string }> = () => (
  <TextAndIconButton
    key="1"
    text={'Code'}
    color="transparent"
    iconPosition="left"
    animateIcon
  >
    <Code />
  </TextAndIconButton>
);

export const Nested: Story<{ children: string }> = () => (
  <div>
    {' '}
    <TextAndIconButton
      key="1"
      text={'Code'}
      color="transparent"
      iconPosition="left"
      animateIcon
    >
      <Code />
    </TextAndIconButton>
  </div>
);

export const NestedThree: Story<{ children: string }> = () => (
  <div>
    <TextAndIconButton key="1" text="Code">
      <Code />
    </TextAndIconButton>
    <TextAndIconButton
      key="2"
      text="Preview"
      color="transparent"
      iconPosition="left"
      animateIcon
    >
      <Show />
    </TextAndIconButton>
    <TextAndIconButton
      key="3"
      text="Settings"
      color="transparent"
      iconPosition="left"
      animateIcon
    >
      <Settings />
    </TextAndIconButton>
  </div>
);
