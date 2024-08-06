import { Meta, StoryFn } from '@storybook/react';
import { Layout } from './Layout';

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Et tortor
consequat id porta nibh venenatis cras. Imperdiet dui accumsan sit amet nulla
facilisi morbi tempus. Fusce ut placerat orci nulla pellentesque dignissim
enim sit amet. Tellus in metus vulputate eu scelerisque felis imperdiet.`;

const args = {
  numberOfColumns: 5,
};

export default {
  title: 'Atoms / Editor / Columns',
  component: Layout,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <Layout>
    {Array.from({ length: props.numberOfColumns }).map((_, i) => (
      <span key={i}>{lorem}</span>
    ))}
  </Layout>
);
