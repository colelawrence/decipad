import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Text,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/client';
import { useState } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
import { GithubSignInButton } from './GithubSignInButton/GithubSignInButton.component';
import { BodyText, Layout, Wrapper } from './index.styles';

export const Landing = () => {
  const history = useHistory();
  const [inputValue, setInputValue] = useState('');

  return (
    <Wrapper>
      <Layout>
        <Box>
          <Image
            src="/assets/decipad-logo-mark-one-color-rgb.svg"
            alt="Logo"
            width={['30px', '30px', '50px']}
            height={['30px', '30px', '50px']}
            borderRadius="5px"
          />
        </Box>
        <Center
          textAlign={['center', 'center', 'left']}
          justifyContent="flex-start"
        >
          <Box maxW="70ch">
            <Heading fontSize={['24px', '24px', '36px']} mb={2}>
              Make sense of numbers
            </Heading>
            <BodyText fontSize={['13px', '13px', '16px']}>
              A new way to create, collaborate and build anything you want with
              numbers. No code. No spreadsheets. No fuss.
            </BodyText>
            <HStack
              as="form"
              mt={3}
              flexWrap={['wrap', 'wrap', 'nowrap']}
              gridGap={['0', '0', '1rem']}
              onSubmit={(e) => {
                e.preventDefault();
                history.push({}); // signIn `replace`s
                signIn('email', { email: inputValue });
              }}
            >
              <Input
                type="text"
                placeholder="Email Address..."
                value={inputValue}
                borderRadius="6px"
                borderColor="gray.400"
                size="sm"
                _hover={{ borderColor: 'gray.600' }}
                _focus={{ outline: 'none', borderColor: 'gray.600' }}
                onChange={(e) => setInputValue(e.target.value)}
                mb={[3, 3, 0]}
                flex={['auto', 'auto', '1']}
              />
              <Button
                type="submit"
                flex="1"
                leftIcon={<Icon as={FiLogIn} />}
                bg="rgb(225, 249, 128)"
                mx="0 !important"
                p="0"
                maxW={['auto', 'auto', '200px']}
                size="sm"
                _hover={{ bg: 'rgb(225, 249, 128)' }}
              >
                Sign in with email
              </Button>
            </HStack>
            <GithubSignInButton
              onClick={() => {
                history.push({}); // signIn `replace`s
                signIn('github');
              }}
            />
            <Link to="/playground">
              <Button
                variant="unstyled"
                cursor="pointer"
                w={['100%', '100%', 'auto']}
                ml={['0', '0', '15px']}
                fontSize="13px"
                textDecor="underline"
                fontWeight="light"
              >
                or try out the playground!
              </Button>
            </Link>
          </Box>
        </Center>
        <Text
          opacity={0.7}
          fontSize="13px"
          textAlign={['center', 'center', 'left']}
        >
          &copy; Copyright 2021 N1N Inc. All Rights Reserved
        </Text>
      </Layout>
    </Wrapper>
  );
};
