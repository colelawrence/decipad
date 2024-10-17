import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { ColorStatus } from './ColorStatus';
import { ColorStatusProps } from './ColorStatusProps';

const args: ComponentProps<typeof ColorStatus> = {
  name: 'draft',
  selected: false,
};

export default {
  title: 'Atoms / UI / Color Status',
  component: ColorStatus,
  decorators: [
    (St: StoryFn) => (
      <div style={{ margin: '5px' }}>
        <St />
      </div>
    ),
  ],
  args,
} as Meta<typeof args>;

export const Normal: StoryFn<typeof args> = (props: ColorStatusProps) => (
  <>
    <ColorStatus {...props} name={'draft'} />
    <ColorStatus {...props} name={'review'} />
    <ColorStatus {...props} name={'approval'} />
  </>
);

export const Selected: StoryFn<typeof args> = (props: ColorStatusProps) => (
  <>
    <ColorStatus {...props} selected={true} name={'draft'} />
    <ColorStatus {...props} selected={true} name={'review'} />
    <ColorStatus {...props} selected={true} name={'done'} />
  </>
);
