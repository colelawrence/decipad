import React from 'react';
import { DimmedMessage } from '../DimmedMessage/DimmedMessage';
import { Frame } from '../Frame/Frame';

export const Dashboard = () => {
  return (
    <Frame>
      <DimmedMessage
        headline="Such empty"
        text="Choose or create a workspace to get started"
      />
    </Frame>
  );
};
