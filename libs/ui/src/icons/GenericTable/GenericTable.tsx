import { FC } from 'react';
import { teal100, teal500 } from '../../primitives';

export const GenericTable = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Generic Table</title>
    <path
      d="M28.1667 2.41675H13.8333C11.9665 2.41675 11.0331 2.41675 10.32 2.78006C9.69282 3.09964 9.18289 3.60957 8.86331 4.23678C8.5 4.94982 8.5 5.88324 8.5 7.75009V17.9167C8.5 19.7836 8.5 20.717 8.86331 21.43C9.18289 22.0573 9.69282 22.5672 10.32 22.8868C11.0331 23.2501 11.9665 23.2501 13.8333 23.2501H28.1667C30.0335 23.2501 30.9669 23.2501 31.68 22.8868C32.3072 22.5672 32.8171 22.0573 33.1367 21.43C33.5 20.717 33.5 19.7836 33.5 17.9167V7.75008C33.5 5.88324 33.5 4.94982 33.1367 4.23678C32.8171 3.60957 32.3072 3.09964 31.68 2.78006C30.9669 2.41675 30.0335 2.41675 28.1667 2.41675Z"
      fill={teal100.rgb}
      stroke={teal500.rgb}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M16.834 2.41663V23.25"
      stroke={teal500.rgb}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M33.5 12.8334H8.5"
      stroke={teal500.rgb}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M25.166 2.41663V23.25"
      stroke={teal500.rgb}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M27.7582 20.543L15.3789 26.858C15.034 27.034 15.1153 27.5484 15.4977 27.6093L21.2612 28.5278C21.3942 28.549 21.5076 28.6357 21.5629 28.7585L24.4236 35.1105C24.5815 35.4609 25.0945 35.4088 25.1786 35.0338L28.3302 20.9869C28.4044 20.6564 28.0599 20.3891 27.7582 20.543Z"
      fill="white"
      stroke={teal500.rgb}
      strokeWidth="1.3"
    />
  </svg>
);
