import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';

export const HelpAndFeedbackButton = () => (
  <Button variant="ghost" leftIcon={<Icon as={FiHelpCircle} />}>
    Help And Feedback
  </Button>
);
