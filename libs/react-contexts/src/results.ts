import React, { ReactNode } from 'react';

import {
  defaultComputerResults,
  Computer,
  NotebookResults,
} from '@decipad/computer';
import { ComputerContextProvider, useComputer } from './computer';

/** A computer provider with a value for tests */
export const TestResultsProvider: React.FC<
  Partial<NotebookResults> & { children?: ReactNode }
> = ({ children, ...contextItem }) => {
  const computer = new Computer();
  computer.results.next({
    ...defaultComputerResults,
    ...contextItem,
  });
  return React.createElement(ComputerContextProvider, { computer }, children);
};

/** Obtain a code line's result from the results context. * */
export const useResult = (blockId: string) =>
  useComputer().getBlockIdResult$.use(blockId);
