import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { ColorStatus } from './ColorStatus';

const args: ComponentProps<typeof ColorStatus> = {
  name: 'To Do',
  selected: false,
};

export default {
  title: 'Atoms / UI / Color Status',
  component: ColorStatus,
  decorators: [
    (St) => (
      <div style={{ margin: '5px' }}>
        <St />
      </div>
    ),
  ],
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => (
  <>
    <ColorStatus {...props} name={'No Status'} />
    <ColorStatus {...props} name={'To Do'} />
    <ColorStatus {...props} name={'In Progress'} />
    <ColorStatus {...props} name={'Done'} />
  </>
);

export const Selected: Story<typeof args> = (props) => (
  <>
    <ColorStatus {...props} selected={true} name={'No Status'} />
    <ColorStatus {...props} selected={true} name={'To Do'} />
    <ColorStatus {...props} selected={true} name={'In Progress'} />
    <ColorStatus {...props} selected={true} name={'Done'} />
  </>
);
