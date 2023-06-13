import { Meta, StoryFn } from '@storybook/react';
import { Code, Settings, Show } from '../../icons';
import { TextAndIconButton } from './TextAndIconButton';

export default {
  title: 'Atoms / UI / Buttons / With Icon',
  component: TextAndIconButton,
} as Meta;

export const Normal: StoryFn<{ children: string }> = () => (
  <TextAndIconButton key="1" text={'Code'}>
    <Code />
  </TextAndIconButton>
);

export const Animated: StoryFn<{ children: string }> = () => (
  <TextAndIconButton key="1" text={'Code'} animateIcon>
    <Code />
  </TextAndIconButton>
);

export const Lefty: StoryFn<{ children: string }> = () => (
  <TextAndIconButton key="1" text={'Code'} iconPosition="left">
    <Code />
  </TextAndIconButton>
);

export const Transparent: StoryFn<{ children: string }> = () => (
  <TextAndIconButton key="1" text={'Code'} color="transparent">
    <Code />
  </TextAndIconButton>
);

export const Everything: StoryFn<{ children: string }> = () => (
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

export const Nested: StoryFn<{ children: string }> = () => (
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

export const NestedThree: StoryFn<{ children: string }> = () => (
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
