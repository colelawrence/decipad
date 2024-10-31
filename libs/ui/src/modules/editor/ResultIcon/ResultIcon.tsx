import { SerializedType } from '@decipad/language-interfaces';
import { Calendar, Formula, Number, TableSmall, Text } from '../../../icons';
import { ReactElement } from 'react';

const icons: Partial<Record<SerializedType['kind'], ReactElement>> = {
  number: <Number />,
  string: <Text />,
  date: <Calendar />,
  table: <TableSmall />,
  column: <TableSmall />,
  function: <Formula />,
};

interface ResultIconProps {
  readonly kind: SerializedType['kind'];
}

export const ResultIcon = ({ kind }: ResultIconProps) =>
  icons[kind] ?? <Number />;
