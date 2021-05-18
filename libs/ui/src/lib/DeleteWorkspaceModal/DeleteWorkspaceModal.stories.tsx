import { Button } from '@chakra-ui/button';
import { action } from '@storybook/addon-actions';
import React from 'react';
import {
  DeleteWorkspaceModal,
  DeleteWorkspaceModalProps,
} from './DeleteWorkspaceModal.component';

export default {
  title: 'Modals/Delete Workspace Modal',
};

export const Modal = ({ name, onDelete }: DeleteWorkspaceModalProps) => (
  <DeleteWorkspaceModal
    openButton={(onOpen) => <Button onClick={onOpen}>Open Modal</Button>}
    name={name}
    onDelete={onDelete}
  />
);

Modal.args = {
  name: 'Deci',
  onDelete: action('clicked'),
};
