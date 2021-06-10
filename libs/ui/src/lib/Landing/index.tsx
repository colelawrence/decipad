import { Box, Center, Heading } from '@chakra-ui/react';
import Image from 'next/image';
import React from 'react';
import { GithubSignInButton } from './GithubSignInButton/GithubSignInButton.component';
import { BodyText, Layout, Wrapper } from './index.styles';

export const Landing = () => {
  return (
    <Wrapper>
      <Layout>
        <Box>
          <Image src="/assets/deci-logo-brand.png" width={75} height={75} />
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
          </Box>
        </Center>
        <BodyText>&copy; Copyright 2021 Deci. All Rights Reserved.</BodyText>
      </Layout>
    </Wrapper>
  );
};
