import { Meta, StoryFn } from '@storybook/react';
import { Expression } from './Expression';

const args = {
  children: <span>children here</span>,
  error: {
    message: 'some error',
    url: 'some url',
  },
  placeholder: 'placeholder',
};

export default {
  title: 'Molecules / Editor / Input / Expression',
  component: Expression,
} as Meta<typeof args>;

export const Normal: StoryFn<typeof args> = (props) => (
  <Expression {...props} />
);
Normal.args = {
  children: <span>1 m/s</span>,
};

export const Error: StoryFn<typeof args> = (props) => <Expression {...props} />;
Error.args = {
  children: <span>Boinkster</span>,
  error: {
    message: 'Ermahgawd wtf',
    url: 'visit me',
  },
};

export const Placeholder: StoryFn<typeof args> = (props) => (
  <Expression {...props} />
);
Placeholder.args = {
  placeholder: 'Your value here',
};
