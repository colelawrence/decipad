import { scheme } from 'vega';

export const initializeVega = () => {
  scheme('deciblues', [
    '#ecf9fd',
    '#daf3fb',
    '#c7edf9',
    '#b5e7f7',
    '#a2e1f5',
    '#8fdbf3',
    '#7dd5f1',
    '#6acfef',
    '#58c9ed',
    'rgba(69, 195, 235)',
  ]);

  scheme('sameblue', [
    'rgba(69, 195, 235)',
    'rgba(69, 195, 235)',
    'rgba(69, 195, 235)',
    'rgba(69, 195, 235)',
    'rgba(69, 195, 235)',
    'rgba(69, 195, 235)',
    'rgba(69, 195, 235)',
    'rgba(69, 195, 235)',
    'rgba(69, 195, 235)',
  ]);
};
