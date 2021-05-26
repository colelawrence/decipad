import { Center, Heading, Text } from '@chakra-ui/layout';

interface DimmedMessageProps {
  headline: string;
  text: string;
}

export const DimmedMessage = ({ headline, text }: DimmedMessageProps) => {
  return (
    <Center h="100%" flexDir="column" opacity={0.4}>
      <Heading textAlign="center" fontWeight="normal">
        {headline}
      </Heading>
      <Text>{text}</Text>
    </Center>
  );
};
