import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Heading = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Heading</title>
      <path
        d="M4.20312 13.0277V2.97229H5.42077V7.45009H10.7824V2.97229H12V13.0277H10.7824V8.53026H5.42077V13.0277H4.20312Z"
        fill={cssVar('currentTextColor')}
      />
    </svg>
  );
};
