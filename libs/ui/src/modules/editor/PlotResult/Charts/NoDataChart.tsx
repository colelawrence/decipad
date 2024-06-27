import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { renderGrid } from '../Components/grid';
import { chartHeight, defaultChartMargins } from '../helpers';
import { noDataChartStyles } from './styles';

export const NoDataChart = () => (
  <ResponsiveContainer width={'100%'} height={chartHeight}>
    <LineChart width={500} height={300} data={[]} margin={defaultChartMargins}>
      {renderGrid('no-data-1')}
      <Line type="monotone" dataKey="none" />
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div style={noDataChartStyles}>No data</div>
      </foreignObject>
    </LineChart>
  </ResponsiveContainer>
);
