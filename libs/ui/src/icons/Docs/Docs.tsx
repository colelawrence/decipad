import { cssVar } from '../../primitives';

export const Docs = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Docs</title>
    <path
      d="M5.24732 3.5H15.7312C15.9122 3.5 16.0589 3.64668 16.0589 3.82762V16.1643C16.0589 16.3452 15.9124 16.4919 15.7314 16.4919H5.23226C4.1929 16.4919 3.5 15.6258 3.5 14.7597V5.24732C3.5 4.2823 4.2823 3.5 5.24732 3.5Z"
      fill={cssVar('backgroundDefault')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
    />
    <path
      d="M5.57118 12.5943H16.0589V16.0551C16.0589 16.2963 15.8633 16.4919 15.622 16.4919H5.68415C4.59208 16.5484 3.5 16.0438 3.5 14.658C3.5 13.2722 4.3653 12.5943 5.57118 12.5943Z"
      fill={cssVar('backgroundDefault')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
    />
  </svg>
);
