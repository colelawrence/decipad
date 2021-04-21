import { Button } from '@chakra-ui/button';
import { Image } from '@chakra-ui/image';
import { Input } from '@chakra-ui/input';
import {
  Box,
  Center,
  Grid,
  Heading,
  HStack,
  Link,
  Text,
} from '@chakra-ui/layout';
import { SlideFade } from '@chakra-ui/transition';
import { Container } from '@decipad/ui';
import React, { useState } from 'react';
import { TermsOfServiceNotice } from '../components/SignUp/TermsOfServiceNotice';

const SignupPage = () => {
  const [value, setValue] = useState('');
  const [codeScreen, setCodeScreen] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(value);
    setCodeScreen(true);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value);

  const isDisabled = value === '';

  return (
    <Container h="100vh" py={10}>
      <Grid gridTemplateRows="auto 1fr auto" h="100%">
        <Box pt={150}>
          <Center>
            <Box textAlign="center">
              <Center pb={5}>
                <HStack>
                  <Image
                    src="/assets/deci-logo-brand.png"
                    alt="Brand"
                    width={60}
                    height={60}
                  />
                  <Heading>Deci</Heading>
                </HStack>
              </Center>
              {!codeScreen && (
                <SlideFade in={!codeScreen} offsetY="20px" unmountOnExit>
                  <Heading fontSize="4xl">Make sense of numbers.</Heading>
                  <Text opacity={0.6} pt={1} fontSize="20px">
                    Start using Deci by entering your email address.
                  </Text>
                  <form onSubmit={onSubmit} autoComplete="off">
                    <Input
                      borderRadius="0"
                      mt={5}
                      name="email"
                      focusBorderColor="pink.400"
                      type="email"
                      placeholder="name@company.com"
                      onChange={onChange}
                    />
                    <Button
                      type="submit"
                      disabled={isDisabled}
                      _disabled={{
                        bg: 'blackAlpha.200',
                        color: 'blackAlpha.400',
                        cursor: 'not-allowed',
                      }}
                      w="100%"
                      bg="pink.400"
                      color="#fff"
                      borderRadius="0"
                      _hover={{
                        bg: isDisabled ? 'blackAlpha.300' : 'pink.600',
                      }}
                      mt={5}
                    >
                      Get Started
                    </Button>
                  </form>
                </SlideFade>
              )}
              {codeScreen && (
                <SlideFade in={codeScreen} offsetY="20px" unmountOnExit>
                  <Box pt={5}>
                    <Heading fontSize="3xl">Check your email address!</Heading>
                    <Text pt={3} maxW="45ch" opacity={0.6}>
                      We have sent you an email with a link that will allow you
                      to sign in to your account immediately!
                    </Text>
                    <Text pt={3} color="pink.400">
                      Didn't receive an email?{' '}
                      <Link textDecor="underline" fontWeight="bold">
                        Resend
                      </Link>
                    </Text>
                  </Box>
                </SlideFade>
              )}
            </Box>
          </Center>
        </Box>
        <Box />
        <TermsOfServiceNotice />
      </Grid>
    </Container>
  );
};

export default SignupPage;
