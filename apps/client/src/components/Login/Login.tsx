import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  Input,
  SlideFade,
  Square,
  Text,
} from '@chakra-ui/react';
import { signin, signIn } from 'next-auth/client';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FiGithub, FiLogIn } from 'react-icons/fi';

export const Login = () => {
  const { register, handleSubmit } = useForm();

  const signInWithEmail = (data: { email: string }) => {
    signin('email', { email: data.email });
  };

  return (
    <Box
      h="100vh"
      background="url(/assets/landing-wallpaper.png) center center no-repeat"
      backgroundSize="cover"
      py="12"
      px="100px"
    >
      <Grid h="100%" gridTemplateRows="auto 1fr auto">
        <SlideFade offsetY="20px" in delay={0.4}>
          <Image
            src="/assets/deci-logo-brand.png"
            alt="Deci logo"
            width="70px"
            height="70px"
            borderRadius="5px"
          />
        </SlideFade>
        <Square justifyContent="flex-start" pb="100px">
          <SlideFade in offsetY="100px" delay={0.8}>
            <Box>
              <Heading fontSize="5xl">MAKE SENSE OF NUMBERS</Heading>
              <Text maxW="75ch" opacity="0.7">
                At Deci, we want to enable everyone to make better decisions
                that make life better. We want to help ops teams, entrepreneurs
                and other business teams alike to codify their processes.
              </Text>
              <Box maxW="60ch">
                <form onSubmit={handleSubmit(signInWithEmail)}>
                  <Flex overflow="hidden" borderRadius="5px" mt="30px">
                    <Input
                      type="text"
                      size="lg"
                      placeholder="Email Address"
                      borderColor="rgba(0, 102, 255, 0.5)"
                      borderWidth="2px"
                      borderRightWidth="0px"
                      borderLeftRadius="5px"
                      borderRadius="0"
                      focusBorderColor="#0066FF"
                      {...register('email', { required: true })}
                    />
                    <Button
                      borderRadius="0"
                      type="submit"
                      bg="#0066FF"
                      color="white"
                      size="lg"
                      px="12"
                      _hover={{ bg: '#0066FF' }}
                    >
                      <Icon as={FiLogIn} mr={3} /> Sign In
                    </Button>
                  </Flex>
                </form>
              </Box>
              <Text opacity="0.7" my="3">
                You can also sign in with your Github account!
              </Text>
              <Button
                onClick={() => signIn('github')}
                bg="black"
                color="white"
                size="lg"
                _hover={{ bg: 'black' }}
              >
                <Icon as={FiGithub} mr={3} /> Sign in with Github
              </Button>
            </Box>
          </SlideFade>
        </Square>
        <SlideFade in offsetY="20px" delay={1.2}>
          <Box>
            <Text opacity="0.7">
              &copy; Copyright Deci 2021. All Rights Reserved.
            </Text>
            <Text opacity="0.7">
              By using our services you acknowledge that you agree to our{' '}
              <Link href="/">
                <Text as="a" textDecor="underline" cursor="pointer">
                  Terms of service
                </Text>
              </Link>{' '}
              and{' '}
              <Link href="/">
                <Text as="a" textDecor="underline" cursor="pointer">
                  Privacy policy.
                </Text>
              </Link>
            </Text>
          </Box>
        </SlideFade>
      </Grid>
    </Box>
  );
};
