import { Button } from '@chakra-ui/button';
import { action } from '@storybook/addon-actions';
import React from 'react';
import {
  NewWorkspaceModal,
  NewWorkspaceModalProps,
} from './NewWorkspaceModal.component';

export default {
  title: 'Dashboard/Modals/New Workspace',
};

export const Modal = ({ createWorkspace }: NewWorkspaceModalProps) => (
  <NewWorkspaceModal
    openButton={(onOpen) => <Button onClick={onOpen}>Open Modal</Button>}
    createWorkspace={createWorkspace}
  />
);

Modal.args = {
  createWorkspace: action('clicked'),
};
