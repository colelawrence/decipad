import type { FC } from 'react';
import { Dot } from '..';
import { statusColors } from '../../utils';
import { ColorStatusProps } from './ColorStatusProps';

export const ColorStatusCircle: FC<ColorStatusProps> = ({
  name = 'draft',
}: ColorStatusProps) => {
  return <Dot color={statusColors[name]} variant />;
};
