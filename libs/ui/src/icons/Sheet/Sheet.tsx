import { cssVar } from '../../primitives';

export const Sheet = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Sheet</title>
    <path
      d="M4.99993 13.597H10.9997C11.828 13.597 12.4996 12.9255 12.4996 12.0971V6.42496C12.4996 5.97979 12.3018 5.55762 11.9598 5.27264L10.5828 4.12522L8.84241 2.7329C8.57559 2.51943 8.24387 2.40348 7.90217 2.40422L4.99669 2.4105C4.16957 2.41228 3.5 3.0833 3.5 3.91042V12.0971C3.5 12.9255 4.17154 13.597 4.99993 13.597Z"
      fill={cssVar('iconBackground')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.19994"
    />
    <path
      d="M7.60926 5.6176L8.43502 2.72744C8.46524 2.62168 8.59523 2.58333 8.67801 2.65576L12.1996 5.73713C12.3038 5.82833 12.2393 6 12.1008 6H7.8977C7.6984 6 7.5545 5.80924 7.60926 5.6176Z"
      fill={cssVar('iconColorMain')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.19994"
    />
  </svg>
);
