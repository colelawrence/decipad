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
      borderRadius="6px"
      bg="blackAlpha.800"
      _hover={{ bg: 'blackAlpha.900' }}
      mt={2}
      w={['100%', '100%', 'auto']}
      leftIcon={<Icon as={FiGithub} />}
      size="sm"
      onClick={onClick}
    >
      Sign in With GitHub
    </Button>
  );
};
