import * as React from 'react';
import { cssVar } from '../../primitives';

export const Gear: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none">
    <path
      fill={cssVar('iconBackgroundColor')}
      stroke={cssVar('normalTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="m3.748 9.975.733.115c.542.085.929.581.89 1.14l-.055.758a.54.54 0 0 0 .297.524l.542.268c.195.096.428.06.587-.09l.545-.515a1.033 1.033 0 0 1 1.425 0l.546.515c.159.15.39.186.586.09l.544-.268a.539.539 0 0 0 .296-.523l-.054-.759a1.069 1.069 0 0 1 .888-1.14l.734-.115a.532.532 0 0 0 .434-.413l.134-.6a.544.544 0 0 0-.216-.565l-.612-.429a1.09 1.09 0 0 1-.317-1.421l.37-.658A.55.55 0 0 0 12 5.284l-.376-.482a.52.52 0 0 0-.566-.179l-.71.222a1.044 1.044 0 0 1-1.285-.632l-.272-.705a.527.527 0 0 0-.491-.341l-.602.001a.527.527 0 0 0-.49.344l-.265.697c-.2.525-.76.802-1.287.637l-.739-.232a.52.52 0 0 0-.568.18l-.373.483a.549.549 0 0 0-.041.606l.378.66a1.09 1.09 0 0 1-.312 1.43l-.605.424a.544.544 0 0 0-.216.564l.134.6a.53.53 0 0 0 .434.414Z"
    />
    <path
      stroke={cssVar('normalTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M9.06 6.94A1.5 1.5 0 1 1 6.94 9.06 1.5 1.5 0 0 1 9.06 6.94Z"
    />
  </svg>
);
