import { Meta, Story } from '@storybook/react';
import { swatchNames, UserIconKey } from '../../utils';
import { Callout } from './Callout';

const args = { children: 'You can edit interactive inputs!' };

export default {
  title: 'Atoms / Editor / Text / Block / Callout',
  component: Callout,
  args,
  argTypes: {
    color: { options: swatchNames, control: { type: 'select' } },
    icon: {
      options: [
        'Rocket' as UserIconKey,
        'Coffee' as UserIconKey,
        'AnnotationWarning' as UserIconKey,
      ],
      control: { type: 'select' },
    },
  },
} as Meta;

export const Normal: Story<typeof args> = (props) => <Callout {...props} />;
