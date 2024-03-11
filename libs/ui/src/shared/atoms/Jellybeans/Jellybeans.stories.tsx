// JellyBeans.stories.tsx
import { Meta, StoryFn } from '@storybook/react';
import { Formula, Home, Magic, Settings } from 'libs/ui/src/icons';
import { JellyBeans, JellyBrainsProps } from './Jellybeans';

const args: JellyBrainsProps = {
  beans: [
    {
      text: 'Default Bean',
    },
  ],
};

export default {
  title: 'Atoms / UI / JellyBeans',
  component: JellyBeans,
  args,
} as Meta<JellyBrainsProps>;

const Template: StoryFn<JellyBrainsProps> = (props) => (
  <JellyBeans {...props} />
);

export const Default = Template.bind({});

export const ColoredBeans = Template.bind({});
ColoredBeans.args = {
  beans: [
    {
      text: 'Red',
      backgroundColor: '#F00',
    },
    {
      text: 'Blue',
      backgroundColor: '#00F',
    },
    {
      text: 'Green',
      backgroundColor: '#0F0',
    },
  ],
};

export const WithIcons = Template.bind({});
WithIcons.args = {
  beans: [
    {
      text: 'Home',
      icon: <Home />,
    },
    {
      text: 'Settings',
      icon: <Settings />,
    },
  ],
};

export const MixedStates = Template.bind({});
MixedStates.args = {
  beans: [
    {
      text: 'Enabled',
    },
    {
      text: 'Disabled',
      disabled: true,
    },
    {
      text: 'With Icon',
      icon: <Magic />,
    },
    {
      text: 'Disabled & Icon',
      icon: <Formula />,
      disabled: true,
    },
  ],
};

export const ColorfulAndIconic = Template.bind({});
ColorfulAndIconic.args = {
  beans: [
    {
      text: 'Red & Home',
      backgroundColor: '#F00',
      icon: <Home />,
    },
    {
      text: 'Blue & Settings',
      backgroundColor: '#00F',
      icon: <Settings />,
    },
    {
      text: 'Green & Disabled',
      backgroundColor: '#0F0',
      disabled: true,
    },
  ],
};

export const OverflowTest = Template.bind({});
OverflowTest.args = {
  beans: Array.from({ length: 100 }, (_, index) => ({
    text: `Bean ${index + 1}`,
    backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  })),
};
