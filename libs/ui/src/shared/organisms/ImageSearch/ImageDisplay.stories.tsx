import { Meta, StoryFn } from '@storybook/react';
import { ImageDisplay, ImageDisplayProps } from './ImageDisplay';

const meta: Meta<typeof ImageDisplay> = {
  title: 'Atom / UI / ImageDisplay',
  component: ImageDisplay,
  argTypes: {
    insertFromPreview: { action: 'inserted' },
  },
};

export default meta;

const Template: StoryFn<ImageDisplayProps> = (args: ImageDisplayProps) => (
  <ImageDisplay {...args} />
);

export const WithImage: StoryFn<ImageDisplayProps> = Template.bind({});
WithImage.args = {
  src: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png',
  alt: 'An example image',
};

export const WithoutImage: StoryFn<ImageDisplayProps> = Template.bind({});
WithoutImage.args = {
  alt: 'Placeholder image',
};
