import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Icon,
  MenuItem,
  useDisclosure,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { useWorkspaces } from '../../../../workspaces.store';

export const DeleteWorkspaceButton = ({ id }: { id: string }) => {
  const router = useRouter();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const set = useWorkspaces((state) => state.set);
  return (
    <>
      <MenuItem icon={<Icon as={FiTrash2} />} onClick={onOpen}>
        Delete
      </MenuItem>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Workspace
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  set((state) => {
                    state.workspaces = state.workspaces.filter(
                      (w) => w.id !== id
                    );
                  });
                  router.push('/');
                  onClose();
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
