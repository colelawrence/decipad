import styled from '@emotion/styled';
import { codeLog, cssVar } from 'libs/ui/src/primitives';

const HEIGHT = 24;
const BAR_WIDTH = 4;

export const Wrapper = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const Value = styled.span(codeLog, {
  color: cssVar('textDefault'),
});

type GraphProps = {
  width: number;
  color: string;
};
export const Graph = styled.div<GraphProps>(({ color, width }) => ({
  height: HEIGHT + 4,
  width: (width * BAR_WIDTH) / 2 + 4,
  padding: 1,
  borderRadius: 2,
  border: `1px solid ${color}`,
  display: 'flex',
  alignItems: 'flex-end',
  backgroundColor: cssVar('backgroundDefault'),
  overflow: 'hidden',
  '& > div': {
    backgroundColor: color,
  },
}));

type BarProps = {
  value: number;
  max: number;
};

export const Bar = styled.div<BarProps>(({ value, max }) => ({
  height: `${(value * HEIGHT) / max}px`,
  width: BAR_WIDTH,
}));
