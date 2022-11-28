import { cssVar } from '../../primitives';

export const Folder = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Folder</title>
    <path
      d="M16.0416 14.375V8.125C16.0416 7.20452 15.2955 6.45833 14.375 6.45833H3.95831V14.375C3.95831 15.2955 4.7045 16.0417 5.62498 16.0417H14.375C15.2955 16.0417 16.0416 15.2955 16.0416 14.375Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.25 6.25L10.4737 4.82692C10.1817 4.29148 9.62048 3.95834 9.01056 3.95834H5.62498C4.7045 3.95834 3.95831 4.70453 3.95831 5.625V9.16667"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
