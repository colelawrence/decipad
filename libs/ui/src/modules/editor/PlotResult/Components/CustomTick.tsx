import { Text } from 'recharts';
import { CustomTickProps } from '../Charts/types';
import { cssVar } from 'libs/ui/src/primitives';

const MAX_TICK_LABEL_LENGTH = 20;

/**
 * Custom tick for the chart which aims to display the text of y axis correctly
 *
 * @param x - The x coordinate of the tick.
 * @param y - The y coordinate of the tick.
 * @param payload - The payload of the tick.
 * @returns The custom tick component.
 */
export const customTick = ({ x, y, payload }: CustomTickProps) => {
  const value = String(payload.value);
  const _value =
    value.length > MAX_TICK_LABEL_LENGTH
      ? `${value.substring(0, MAX_TICK_LABEL_LENGTH)}...`
      : value;

  return (
    <Text
      textAnchor="start"
      verticalAnchor="middle"
      fontSize={11}
      style={{
        fill: cssVar('textDisabled'),
      }}
      x={x + 16} // Distance from the axis
      y={y}
    >
      {_value}
    </Text>
  );
};
