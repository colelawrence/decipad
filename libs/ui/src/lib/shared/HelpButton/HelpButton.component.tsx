import { Button, Icon } from '@chakra-ui/react';
import { FiHelpCircle } from 'react-icons/fi';

export const HelpButton = () => {
  return (
    <Button
      as="a"
      href="https://www.notion.so/decipad/What-is-Deci-d140cc627f1e4380bb8be1855272f732"
      target="_blank"
      m={10}
      justifySelf="end"
      leftIcon={<Icon as={FiHelpCircle} />}
    >
      Help &amp; Documentation
    </Button>
  );
};
