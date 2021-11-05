import { Meta, Story } from '@storybook/react';
import { cssVar } from '../../primitives';
import { MenuList } from '../../molecules';
import { MenuItem } from '../index';
import { TriggerMenuItem } from './TriggerMenuItem';

interface Args {
  children: string;
}

export default {
  title: 'Atoms / Trigger Menu Item',
  component: TriggerMenuItem,
  args: {
    children: 'Text',
  },
} as Meta<Args>;

export const TextOnly: Story<Args> = (args) => (
  <MenuList defaultOpen trigger={<span></span>}>
    <MenuList trigger={<TriggerMenuItem {...args} />}>
      <MenuItem {...args} />
    </MenuList>
  </MenuList>
);
export const Icon: Story<Args> = (args) => (
  <MenuList defaultOpen trigger={<span></span>}>
    <MenuList
      trigger={
        <TriggerMenuItem
          icon={
            <svg viewBox="0 0 16 16">
              <circle
                cx="50%"
                cy="50%"
                r="50%"
                fill={cssVar('currentTextColor')}
              />
            </svg>
          }
          {...args}
        />
      }
    >
      <MenuItem {...args} />
    </MenuList>
  </MenuList>
);
