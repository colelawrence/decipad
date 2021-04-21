import { Button } from '@chakra-ui/button';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { NewWorkspaceModal } from './NewWorkspaceModal.component';

export default {
  title: 'Modals/New Workspace Modal',
};

export const Modal = ({ createWorkspace }) => (
  <NewWorkspaceModal
    openButton={(onOpen) => <Button onClick={onOpen}>Open Modal</Button>}
    createWorkspace={createWorkspace}
  />
);

Modal.args = {
  createWorkspace: action('clicked'),
};
