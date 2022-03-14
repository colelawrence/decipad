import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
} from '@chakra-ui/react';
import { plugins } from '@decipad/editor-config';
import { FC } from 'react';
import { Error } from '../../components';

export function UploadDialogue({
  uploadState,
  clearAll,
}: {
  uploadState: plugins.UploadState;
  clearAll: () => void;
}): ReturnType<FC> {
  const isOpen = uploadState.length > 0;
  return (
    <>
      <Modal isOpen={isOpen} onClose={clearAll}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <DialogueContent uploadState={uploadState} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={clearAll}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function DialogueContent({
  uploadState,
}: {
  uploadState: plugins.UploadState;
}): ReturnType<FC> {
  return <>{uploadState.map(DialogueContentForOneFile)}</>;
}

function DialogueContentForOneFile(
  props: plugins.OneFileUploadState
): ReturnType<FC> {
  return (
    <>
      <span>{props.filename}: </span>
      {props.error ? (
        <Error message={props.error} />
      ) : (
        <Progress size="xs" isIndeterminate />
      )}
    </>
  );
}
