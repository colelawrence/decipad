import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../../storybook-utils';
import { BooleanResult } from './BooleanResult';
import { CodeResultProps } from '../../../types';

export default {
  title: 'Atoms / Editor / Results / Boolean',
  component: BooleanResult,
} as Meta;

export const Selected: StoryFn<ComponentProps<typeof BooleanResult>> = (
  props: CodeResultProps<'boolean'>
) => <BooleanResult {...props} />;
Selected.decorators = [withCode('true')];

export const Unselected: StoryFn<ComponentProps<typeof BooleanResult>> = (
  props: CodeResultProps<'boolean'>
) => <BooleanResult {...props} />;
Unselected.decorators = [withCode('false')];
