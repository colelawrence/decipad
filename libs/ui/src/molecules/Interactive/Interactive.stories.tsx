import { Meta, Story } from '@storybook/react';
import { Placeholder } from '../../icons';
import { padding } from '../../storybook-utils';
import { Interactive } from './Interactive';

const defaultArgs = {
  children: 'Interactive element here',
};

export default {
  title: 'Molecules / Editor / Interactive',
  component: Interactive,
  decorators: [padding(10)],
} as Meta;

export const Normal: Story<typeof defaultArgs> = (props) => (
  <Interactive {...props} />
);
Normal.args = defaultArgs;

const withIconArgs = { ...defaultArgs, icon: <Placeholder /> };
export const WithIcon: Story<typeof withIconArgs> = (props) => (
  <Interactive {...props} />
);
WithIcon.args = withIconArgs;

const withNameArgs = { ...defaultArgs, name: 'DiscountRate' };
export const WithName: Story<typeof withNameArgs> = (props) => (
  <Interactive {...props} />
);
WithName.args = withNameArgs;

const withRightArgs = { ...defaultArgs, right: <Placeholder /> };
export const WithRight: Story<typeof withRightArgs> = (props) => (
  <Interactive {...props} />
);
WithRight.args = withRightArgs;

const withReadOnlyArgs = {
  ...defaultArgs,
  name: 'DiscountRate',
  readOnly: true,
};
export const ReadOnly: Story<typeof withReadOnlyArgs> = (props) => (
  <Interactive {...props} />
);
ReadOnly.args = withReadOnlyArgs;
