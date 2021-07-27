import { Spinner, Square } from '@chakra-ui/react';

export const LoadingSpinnerPage = () => {
  return (
    <Square h="100vh" w="100vw">
      <Spinner size="xl" />
    </Square>
  );
};
