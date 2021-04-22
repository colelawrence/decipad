import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import React from 'react';
import { FiDownload } from 'react-icons/fi';

export const ImportButton = () => {
  return (
    <Button leftIcon={<Icon as={FiDownload} />} variant="ghost">
      Import
    </Button>
  );
};
