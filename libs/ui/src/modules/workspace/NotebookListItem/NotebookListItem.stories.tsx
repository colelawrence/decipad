import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { AvailableColorStatus, TColorStatus } from '../../../utils';
import { AvailableSwatchColor, swatchNames } from '../../../utils/swatches';
import { NotebookListItem, NotebookListItemProps } from './NotebookListItem';
import { UserIconKey } from '@decipad/editor-types';

const asyncNoop = async () => null as any;

const args: ComponentProps<typeof NotebookListItem> = {
  permissionType: null,
  iconColor: 'Malibu' as AvailableSwatchColor,
  icon: 'Rocket' as UserIconKey,
  name: 'Getting started with Decipad',
  status: 'To Do' as TColorStatus,
  isPublic: true,
  id: '123',
  actions: {
    onDeleteNotebook: asyncNoop,
    onUnarchiveNotebook: asyncNoop,
    onDownloadNotebook: asyncNoop,
    onDownloadNotebookHistory: asyncNoop,
    onMoveToSection: asyncNoop,
    onMoveToWorkspace: asyncNoop,
    onChangeStatus: asyncNoop,
    onDuplicateNotebook: asyncNoop,
    onPublishNotebook: asyncNoop,
    onUpdatePublishState: asyncNoop,
    onUpdateAllowDuplicate: asyncNoop,
    onAddAlias: asyncNoop,
    onRemoveAlias: asyncNoop,
  },
  notebookId: '123',
  isArchived: false,
  workspaces: [],
  workspaceId: '456',
  onDuplicate: () => {},
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
    (St: StoryFn) => (
      <div style={{ margin: '5px' }}>
        <St />
      </div>
    ),
  ],
  args,
} as Meta<typeof args>;

export const Normal: StoryFn<typeof args> = (props: NotebookListItemProps) => (
  <NotebookListItem {...props} id="nb" />
);
