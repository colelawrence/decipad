import { Meta, StoryFn } from '@storybook/react';
import { swatchNames } from '../../utils';
import { Callout } from './Callout';
import { UserIconKey } from '@decipad/editor-types';

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

export const Normal: StoryFn<typeof args> = (props) => <Callout {...props} />;
