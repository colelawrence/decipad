import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { swatchNames, baseSwatches } from '../../primitives';
import { ColorPicker } from './ColorPicker';

const args: ComponentProps<typeof ColorPicker> = {
  color: baseSwatches.Catskill,
  selected: false,
};

export default {
  title: 'Atoms / Color Picker',
  component: ColorPicker,
  argTypes: {
    color: {
      options: swatchNames,
      mapping: baseSwatches,
    },
    selected: { control: 'boolean' },
  },
  decorators: [
    (St) => (
      <div style={{ margin: '5px' }}>
        <St />
      </div>
    ),
  ],
  args,
} as Meta<typeof args>;

export const Normal: Story<typeof args> = (props) => <ColorPicker {...props} />;
