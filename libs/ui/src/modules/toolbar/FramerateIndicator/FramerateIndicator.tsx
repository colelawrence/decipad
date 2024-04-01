import { useFramerate } from './useFramerate';
import * as Styled from './styles';
import { brand400, red400, yellow400 } from 'libs/ui/src/primitives';

const WIDTH = 48;

const pickColor = (value: number) => {
  if (value < 24) {
    return red400.hex;
  }
  if (value < 48) {
    return yellow400.hex;
  }
  return brand400.hex;
};

export const FramerateIndicator = () => {
  const { framerate, avgFramerate, maxFramerate, currentFramerate } =
    useFramerate(Math.floor(WIDTH / 2));

  return (
    <Styled.Wrapper>
      <Styled.Value>
        {currentFramerate && avgFramerate
          ? `${currentFramerate} FPS [${avgFramerate} AVG]`
          : 'Calculating...'}
      </Styled.Value>

      <Styled.Graph width={WIDTH} color={pickColor(currentFramerate)}>
        {framerate.map((value, i) => (
          <Styled.Bar key={i} value={value} max={maxFramerate} />
        ))}
      </Styled.Graph>
    </Styled.Wrapper>
  );
};
