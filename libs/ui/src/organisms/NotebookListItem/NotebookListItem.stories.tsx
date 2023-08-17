import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { AvailableColorStatus, TColorStatus, UserIconKey } from '../../utils';
import { AvailableSwatchColor, swatchNames } from '../../utils/swatches';
import { NotebookListItem } from './NotebookListItem';
import { noop } from '@decipad/utils';

const args: ComponentProps<typeof NotebookListItem> = {
  iconColor: 'Malibu' as AvailableSwatchColor,
  icon: 'Rocket' as UserIconKey,
  name: 'Getting started with Decipad',
  status: 'To Do' as TColorStatus,
  isPublic: true,
  id: '123',
  onDelete: noop,
  onMoveToSection: noop,
  onDuplicate: noop as any,
  onChangeStatus: noop,
  onExport: noop,
  onUnarchive: noop,
  onExportBackups: noop,
  onMoveWorkspace: noop,
  notebookId: '123',
  isArchived: false,
  workspaces: [],
};

export default {
  title: 'Organisms / UI / Notebook List / Item',
  component: NotebookListItem as any,
  argTypes: {
    iconColor: { options: swatchNames, control: { type: 'radio' } },
    status: { options: AvailableColorStatus, control: { type: 'radio' } },
    icon: {
      options: ['Rocket' as UserIconKey, 'Coffee' as UserIconKey],
      control: { type: 'radio' },
    },
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

export const Normal: StoryFn<typeof args> = (props) => (
  <NotebookListItem {...props} id="nb" />
);
