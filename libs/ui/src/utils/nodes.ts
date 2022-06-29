import React from 'react';

export const isNodeEmpty = (children: React.ReactNode) =>
  !Array.isArray(children) ||
  children.length > 1 ||
  !children[0]?.props?.text?.text?.trim();
