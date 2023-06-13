import { Meta, StoryFn } from '@storybook/react';
import { Button, TextAndIconButton } from '../../atoms';
import { Code, Key, People, Settings, Show } from '../../icons';
import { Tabs } from './Tabs';

export default {
  title: 'Molecules / UI / Tabs',
  component: Tabs,
} as Meta;

export const Normal: StoryFn = () => (
  <Tabs>
    <Button key="1" children={'Code'} size={'extraSlim'} />
    <Button key="2" children={'Preview'} disabled size={'extraSlim'} />
    <Button key="3" children={'Settings'} disabled size={'extraSlim'} />
  </Tabs>
);

export const WithIcons: StoryFn = () => (
  <Tabs>
    <TextAndIconButton key="1" text="Code" size="normal" iconPosition="left">
      <Code />
    </TextAndIconButton>
    <TextAndIconButton
      key="2"
      text="Preview"
      color="transparent"
      iconPosition="left"
      animateIcon
      size="normal"
    >
      <Show />
    </TextAndIconButton>
    <TextAndIconButton
      key="3"
      text="Settings"
      color="transparent"
      iconPosition="left"
      animateIcon
      size="normal"
    >
      <Settings />
    </TextAndIconButton>
  </Tabs>
);

export const Sidebar: StoryFn = () => (
  <Tabs>
    <TextAndIconButton key="1" text="Insert" size="normal" />
    <TextAndIconButton
      key="2"
      color="transparent"
      text="Modelling"
      size="normal"
    />
    <TextAndIconButton key="3" color="transparent" text="Style" size="normal" />
    <TextAndIconButton
      key="4"
      color="transparent"
      text="Settings"
      size="normal"
    />
  </Tabs>
);

export const TeamOrPrivate: StoryFn = () => (
  <Tabs>
    <TextAndIconButton key="1" text="Team" size="normal" iconPosition="left">
      <People />
    </TextAndIconButton>
    <TextAndIconButton
      key="1"
      text="Private"
      color="transparent"
      iconPosition="left"
      size="normal"
    >
      <Key />
    </TextAndIconButton>
  </Tabs>
);
