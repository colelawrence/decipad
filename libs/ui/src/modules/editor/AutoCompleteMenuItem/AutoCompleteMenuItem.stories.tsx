import { Meta, StoryFn } from '@storybook/react';
import { inMenu } from '../../../storybook-utils';
import {
  AutoCompleteMenuItem,
  AutoCompleteMenuItemProps,
} from './AutoCompleteMenuItem';
import { ComponentProps } from 'react';

const args: ComponentProps<typeof AutoCompleteMenuItem> = {
  item: {
    autocompleteGroup: 'variable',
    kind: 'number',
    name: 'MyVariable',
  },
};

export default {
  title: 'Atoms / Editor / Auto Complete Menu / Item',
  component: AutoCompleteMenuItem,
  args,
  decorators: [inMenu],
} as Meta;

export const Normal: StoryFn<typeof args> = (
  props: AutoCompleteMenuItemProps
) => <AutoCompleteMenuItem {...props} />;

export const Active: StoryFn<typeof args> = (
  props: AutoCompleteMenuItemProps
) => <AutoCompleteMenuItem focused={true} {...props} />;
