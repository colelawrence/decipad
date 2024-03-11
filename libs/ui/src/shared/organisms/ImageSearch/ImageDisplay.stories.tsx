import { Meta, Story } from '@storybook/react';
import { ImageDisplay, ImageDisplayProps } from './ImageDisplay';

export default {
  title: 'Atom / UI / ImageDisplay',
  component: ImageDisplay,
  argTypes: {
    insertFromPreview: { action: 'inserted' },
  },
} as Meta;

const Template: Story<ImageDisplayProps> = (args) => <ImageDisplay {...args} />;

export const WithImage = Template.bind({});
WithImage.args = {
  src: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png',
  alt: 'An example image',
};

export const WithoutImage = Template.bind({});
WithoutImage.args = {
  alt: 'Placeholder image',
};
