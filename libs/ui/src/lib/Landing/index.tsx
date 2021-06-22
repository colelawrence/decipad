import { Box, Button, Center, Heading, Icon, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import React from 'react';
import { FiPlay } from 'react-icons/fi';
import { GithubSignInButton } from './GithubSignInButton/GithubSignInButton.component';
import { BodyText, Layout, Wrapper } from './index.styles';

export const Landing = () => {
  return (
    <Wrapper>
      <Layout>
        <Box>
          <Image
            src="/assets/deci-logo-brand.png"
            alt="Logo"
            width={75}
            height={75}
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
            <GithubSignInButton />
            <Link to="/playground">
              <Button
                size="lg"
                colorScheme="blue"
                mt={3}
                cursor="pointer"
                ml={6}
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
