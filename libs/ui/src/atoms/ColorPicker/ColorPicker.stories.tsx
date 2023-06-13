import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { baseSwatches } from '../../utils';
import { ColorPicker } from './ColorPicker';

const args: ComponentProps<typeof ColorPicker> = {
  color: baseSwatches.Catskill,
  selected: false,
};

export default {
  title: 'Atoms / UI / Color Picker',
  component: ColorPicker,
  decorators: [
    (St) => (
      <div style={{ margin: '5px' }}>
        <St />
      </div>
    ),
  ],
  args,
} as Meta<typeof args>;

export const Normal: StoryFn<typeof args> = (props) => (
  <>
    <ColorPicker {...props} color={baseSwatches.Malibu} />
    <ColorPicker {...props} color={baseSwatches.Sun} />
    <ColorPicker {...props} color={baseSwatches.Catskill} />
    <ColorPicker {...props} color={baseSwatches.Sulu} />
    <ColorPicker {...props} color={baseSwatches.Perfume} />
    <ColorPicker {...props} color={baseSwatches.Rose} />
  </>
);

export const Selected: StoryFn<typeof args> = (props) => (
  <>
    <ColorPicker {...props} selected={true} color={baseSwatches.Malibu} />
    <ColorPicker {...props} selected={true} color={baseSwatches.Sun} />
    <ColorPicker {...props} selected={true} color={baseSwatches.Catskill} />
    <ColorPicker {...props} selected={true} color={baseSwatches.Sulu} />
    <ColorPicker {...props} selected={true} color={baseSwatches.Perfume} />
    <ColorPicker {...props} selected={true} color={baseSwatches.Rose} />
  </>
);
