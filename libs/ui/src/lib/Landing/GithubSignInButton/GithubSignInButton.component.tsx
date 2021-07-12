import { Button, Icon } from '@chakra-ui/react';
import { FiGithub } from 'react-icons/fi';
import { noop } from '../../../utils';

interface GithubSignInButtonProps {
  onClick?: () => void;
}

export const GithubSignInButton = ({
  onClick = noop,
}: GithubSignInButtonProps) => {
  return (
    <Button
      colorScheme="blackAlpha"
      bg="blackAlpha.800"
      _hover={{ bg: 'blackAlpha.900' }}
      mt={3}
      size="lg"
      leftIcon={<Icon as={FiGithub} />}
      onClick={onClick}
    >
      Sign in With GitHub
    </Button>
  );
};
