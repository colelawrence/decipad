import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/client';
import React, { useState } from 'react';
import { FiLogIn, FiPlay } from 'react-icons/fi';
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
            src="/assets/deci-logo-brand.png"
            alt="Logo"
            width="60px"
            height="60px"
            borderRadius="5px"
          />
        </Box>
        <Center justifyContent="flex-start">
          <Box>
            <Heading size="2xl" mb={3}>
              MAKE BETTER DECISIONS
            </Heading>
            <BodyText maxW="70ch">
              Deci is a way to build, report and model your data. Make better
              decisions. Use it on its own or with other tools such as Tableau,
              Power BI, Rapise and Excel. It enables you to construct rich
              interactive stories that can be analysed using timelines, gauges,
              maps and pivot tables.
            </BodyText>
            <HStack
              as="form"
              mt={3}
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
                onChange={(e) => setInputValue(e.target.value)}
                size="lg"
              />
              <Button
                type="submit"
                px={12}
                leftIcon={<Icon as={FiLogIn} />}
                colorScheme="messenger"
                size="lg"
              >
                Sign in
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
                size="lg"
                colorScheme="messenger"
                mt={3}
                cursor="pointer"
                ml={2}
                leftIcon={<Icon as={FiPlay} />}
              >
                Playground
              </Button>
            </Link>
          </Box>
        </Center>
        <BodyText>&copy; Copyright 2021 Deci. All Rights Reserved.</BodyText>
      </Layout>
    </Wrapper>
  );
};
