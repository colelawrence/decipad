import { Spinner, Square } from '@chakra-ui/react';

export const LoadingSpinnerPage = () => {
  return (
    <Square size="100vw">
      <Spinner size="xl" />
    </Square>
  );
};
