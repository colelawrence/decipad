import { cssVar } from '../../primitives';

export const Magic = (): ReturnType<React.FC> => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
    <title>Magic</title>
    <path
      d="M5.36764 7.69048C4.59345 9 3.04506 9 2.3999 9C3.04506 9 4.59345 9.2619 5.36764 10.3095C6.14184 11.3571 6.35689 12.9087 6.3999 14C6.3999 13.1706 6.77524 11.1985 7.43216 10.3095C8.20635 9.2619 9.75474 9 10.3999 9C9.75474 9 8.20635 9 7.43216 7.69048C6.7098 6.46862 6.58593 4.96032 6.49991 4C6.41389 4.96032 6.0601 6.5192 5.36764 7.69048Z"
      fill={cssVar('iconColorHeavy')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M11.0486 4.27249C10.6185 5 9.75833 5 9.3999 5C9.75833 5 10.6185 5.1455 11.0486 5.72751C11.4788 6.30952 11.5982 6.89374 11.6221 7.5C11.6221 7.03924 11.8306 6.22137 12.1956 5.72751C12.6257 5.1455 13.4859 5 13.8443 5C13.4859 5 12.6257 5 12.1956 4.27249C11.7943 3.59368 11.6699 3.03351 11.6221 2.5C11.5743 3.03351 11.4333 3.62178 11.0486 4.27249Z"
      fill={cssVar('iconColorHeavy')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
  </svg>
);
