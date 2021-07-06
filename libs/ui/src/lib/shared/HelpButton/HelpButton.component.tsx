import { Button, Icon } from '@chakra-ui/react';

import { FiHelpCircle } from 'react-icons/fi';

export const HelpButton = () => {
  return (
    <Button
      as="a"
      href="https://www.notion.so/decipad/Deci-101-3f3b513b9a82499080eef6eef87d8179"
      target="_blank"
      pos="absolute"
      right={10}
      bottom={10}
      leftIcon={<Icon as={FiHelpCircle} />}
    >
      Help &amp; Documentation
    </Button>
  );
};
