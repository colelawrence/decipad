import { CartesianGrid } from 'recharts';
import { plotBorder } from './styles';

export const renderGrid = (aKey?: string) => [
  <CartesianGrid
    key={aKey}
    stroke={plotBorder}
    horizontal={true}
    vertical={true}
    strokeDasharray="3 3"
  />,
];
