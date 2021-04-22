import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import React from 'react';
import { FiPlus } from 'react-icons/fi';

export const NewButton = () => {
  return (
    <Button leftIcon={<Icon as={FiPlus} />} variant="ghost">
      New
    </Button>
  );
};
