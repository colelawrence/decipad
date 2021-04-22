import { Button } from '@chakra-ui/button';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { DeleteWorkspaceModal } from './DeleteWorkspaceModal.component';

export default {
  title: 'Dashboard/Modals/Delete Workspace',
};

export const Modal = ({ name, onDelete }) => (
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
