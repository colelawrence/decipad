import { Meta, Story } from '@storybook/react';
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

export const Normal: Story<typeof args> = (props) => <Expression {...props} />;
Normal.args = {
  children: <span>1 m/s</span>,
};

export const Error: Story<typeof args> = (props) => <Expression {...props} />;
Error.args = {
  children: <span>Boinkster</span>,
  error: {
    message: 'Ermahgawd wtf',
    url: 'visit me',
  },
};

export const Placeholder: Story<typeof args> = (props) => (
  <Expression {...props} />
);
Placeholder.args = {
  placeholder: 'Your value here',
};
