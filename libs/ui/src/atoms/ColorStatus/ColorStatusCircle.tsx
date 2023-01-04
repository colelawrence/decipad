import { FC } from 'react';
import { Dot } from '..';
import { statusColors } from '../../utils';
import { ColorStatusProps } from './ColorStatus';

export const ColorStatusCircle = ({
  name = 'draft',
}: ColorStatusProps): ReturnType<FC> => {
  return <Dot color={statusColors[name]} variant />;
};
