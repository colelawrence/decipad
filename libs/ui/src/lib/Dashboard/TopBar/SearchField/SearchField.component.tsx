import Icon from '@chakra-ui/icon';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input';
import React from 'react';
import { FiSearch } from 'react-icons/fi';

export const SearchField = () => {
  return (
    <form>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          children={<Icon as={FiSearch} />}
        />
        <Input
          type="text"
          maxW="500px"
          placeholder="Search across all pads and spaces..."
        />
      </InputGroup>
    </form>
  );
};
