import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Heading = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Heading</title>
      <path
        d="M5.75 5.75H7.25M7.25 5.75H8.25M7.25 5.75V11.75M7.25 18.25H5.75M7.25 18.25H8.25M7.25 18.25V11.75M7.25 11.75H16.75M16.75 11.75V5.75M16.75 11.75V18.25M18.25 5.75H16.75M16.75 5.75H15.75M16.75 18.25H18.25M16.75 18.25H15.75"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
