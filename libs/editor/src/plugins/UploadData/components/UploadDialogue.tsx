import { FC } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
} from '@chakra-ui/react';
import { UploadState, OneFileUploadState } from '../useUploadDataPlugin';
import { Error } from '../../../components/Error';

export function UploadDialogue({
  uploadState,
  clearAll,
}: {
  uploadState: UploadState;
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
  uploadState: UploadState;
}): ReturnType<FC> {
  return <>{uploadState.map(DialogueContentForOneFile)}</>;
}

function DialogueContentForOneFile(props: OneFileUploadState): ReturnType<FC> {
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
