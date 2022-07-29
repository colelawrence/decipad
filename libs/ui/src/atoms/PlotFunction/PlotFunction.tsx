import Fraction from '@decipad/fraction';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { DefaultFunctionResult } from '../DefaultFunctionResult/DefaultFunctionResult';

interface PlotFunctionProps {
  fn: (n: Fraction) => Promise<Fraction | undefined>;
  version: number;
  sampleInterval?: Fraction;
  height?: number;
  width?: number;
  maxX: Fraction;
  maxY: Fraction;
  lineColor?: string;
  onFinishRender: (version: number, variance: number) => void;
}

const margin = 2;

export const PlotFunction: FC<PlotFunctionProps> = ({
  fn,
  version,
  maxX,
  maxY,
  width = 200,
  sampleInterval = maxX.sub(maxX.neg()).div(width * 2),
  lineColor = 'teal',
  height = 100,
  onFinishRender,
}) => {
  const [sampleX, setSampleX] = useState(() => maxX.neg());
  const [points, setPoints] = useState('');
  const [renderPoints, setRenderPoints] = useState<string>('');
  const [variance, setVariance] = useState<[number, number]>([0, 0]);

  const xScale = useMemo(
    () => new Fraction(width).div(maxX.sub(maxX.neg())).valueOf(),
    [maxX, width]
  );

  const yScale = useMemo(
    () => new Fraction(height).div(maxY.sub(maxY.neg())).valueOf(),
    [height, maxY]
  );

  const placePoint = useCallback(
    (x: number, y: number): [number, number] => {
      return [
        x * xScale + width / 2,
        height - (y * yScale + height / 2) + margin,
      ];
    },
    [height, width, xScale, yScale]
  );

  const [lastResult, setLastResult] = useState<Fraction | undefined>();

  useEffect(() => {
    setSampleX(maxX.neg());
    setPoints('');
    setRenderPoints('');
    setVariance([0, 0]);
  }, [maxX]);

  const internalOnFinishRender = useCallback(() => {
    setRenderPoints(points);
    const [varTotal, sampleSize] = variance;
    const newVariance = sampleSize > 0 ? varTotal / sampleSize : 0;
    onFinishRender(version, newVariance);
  }, [onFinishRender, points, variance, version]);

  useEffect(() => {
    let stop = false;
    const req = requestAnimationFrame(async () => {
      if (stop) {
        return;
      }
      if (sampleX.compare(maxX) <= 0) {
        const originalY = await fn(sampleX);
        if (originalY != null) {
          const [x, y] = placePoint(sampleX.valueOf(), originalY.valueOf());
          setLastResult(originalY);
          setPoints((p) => {
            const currentPath = p;
            return currentPath ? `${currentPath} L${x},${y}` : `M${x},${y}`;
          });
          setVariance((v) => {
            let [newV, sampleSize] = v;
            if (lastResult) {
              newV += lastResult.sub(originalY).abs().valueOf();
              sampleSize += 1;
            }
            return [newV, sampleSize];
          });
        } else if (lastResult) {
          // no result, so let's just move the SVG cursor there
          const [x, y] = placePoint(sampleX.valueOf(), lastResult.valueOf());
          setPoints((p) => `${p} M${x},${y}`);
        }
        setSampleX((x) => x.add(sampleInterval));
      } else {
        internalOnFinishRender();
      }
    });

    return () => {
      cancelAnimationFrame(req);
      stop = true;
    };
  }, [
    fn,
    internalOnFinishRender,
    lastResult,
    maxX,
    placePoint,
    sampleInterval,
    sampleX,
    version,
  ]);

  return (
    (renderPoints && (
      <svg
        width={width}
        height={height + margin * 2}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <line
            x1={0}
            y1={height / 2 + margin}
            x2={width}
            y2={height / 2 + margin}
            stroke="grey"
            strokeWidth="0.5"
          />
          <line
            y1={0}
            x1={width / 2}
            y2={height}
            x2={width / 2}
            stroke="grey"
            strokeWidth="0.5"
          />
          <path
            stroke={lineColor}
            strokeWidth={2}
            fill="none"
            d={renderPoints}
          />
        </g>
      </svg>
    )) || <DefaultFunctionResult />
  );
};
