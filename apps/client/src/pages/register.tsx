import { Button } from '@chakra-ui/button';
import { Image } from '@chakra-ui/image';
import { Input } from '@chakra-ui/input';
import { Box, Center, Grid, Heading, HStack, Text } from '@chakra-ui/layout';
import { SlideFade } from '@chakra-ui/transition';
import { Container } from '@decipad/ui';
import React from 'react';
import { TermsOfServiceNotice } from '../components/SignUp/TermsOfServiceNotice';

const RegisterPage = () => {
  return (
    <Container h="100vh" py={10}>
      <Grid h="100%" gridTemplateRows="auto 1fr auto">
        <Center alignItems="initial" pt={150}>
          <Box textAlign="center" maxW="40ch">
            <Center>
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

            <SlideFade in={true} offsetY="20px">
              <Heading pt={5} pb={1} fontSize="4xl">
                Getting started
              </Heading>
              <Text pb={5} opacity={0.6} fontSize="20px">
                We would love to get to know more about you!
              </Text>
              <form autoComplete="off">
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  focusBorderColor="pink.400"
                  borderRadius="0"
                />
                <Input
                  type="text"
                  focusBorderColor="pink.400"
                  name="lastName"
                  placeholder="Last Name"
                  borderRadius="0"
                  mt={5}
                />
                <Button
                  w="100%"
                  mt={5}
                  borderRadius="0"
                  bg="pink.400"
                  color="#fff"
                  _hover={{ bg: 'pink.600' }}
                >
                  Start using Deci!
                </Button>
              </form>
            </SlideFade>
          </Box>
        </Center>
        <Box />
        <TermsOfServiceNotice />
      </Grid>
    </Container>
  );
};

export default RegisterPage;
