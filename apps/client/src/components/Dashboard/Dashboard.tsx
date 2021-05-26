import React from 'react';
import { Frame } from '../Frame/Frame';
import { DimmedMessage } from '../DimmedMessage/DimmedMessage';

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
