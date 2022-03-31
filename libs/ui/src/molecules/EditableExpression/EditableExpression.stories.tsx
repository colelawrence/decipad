import { Meta, Story } from '@storybook/react';

import { EditableExpression } from './EditableExpression';

const args = {
  focused: true,
  content: 'bananas',
};

export default {
  title: 'Molecules / Expression / Editable Expression',
  component: EditableExpression,
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <EditableExpression {...props}>{props.content}</EditableExpression>
);
