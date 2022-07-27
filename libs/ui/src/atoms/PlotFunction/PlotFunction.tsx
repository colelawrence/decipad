import Fraction from '@decipad/fraction';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

interface PlotFunctionProps {
  fn: (n: Fraction) => Promise<Fraction | undefined>;
  version?: number;
  sampleInterval?: Fraction;
  height?: number;
  width?: number;
  minX: Fraction;
  maxX: Fraction;
  minY: Fraction;
  maxY: Fraction;
  lineColor?: string;
  onFinishRender: (version: number, hasValues: boolean) => void;
}

const margin = 2;

export const PlotFunction: FC<PlotFunctionProps> = ({
  fn,
  version,
  minX,
  maxX,
  minY,
  maxY,
  width = 200,
  sampleInterval = maxX.sub(minX).div(width * 2),
  lineColor = 'teal',
  height = 100,
  onFinishRender,
}) => {
  if (minX.compare(maxX) > 0) {
    throw new TypeError('minX must be <= maxX');
  }
  const [sampleX, setSampleX] = useState<Map<number, Fraction>>(new Map());
  const [points, setPoints] = useState<Map<number, string>>(new Map());
  const [internalVersion, setInternalVersion] = useState(0);

  const xScale = useMemo(
    () => new Fraction(width).div(maxX.sub(minX)).valueOf(),
    [maxX, minX, width]
  );

  const yScale = useMemo(
    () => new Fraction(height).div(maxY.sub(minY)).valueOf(),
    [height, maxY, minY]
  );

  useEffect(() => {
    if (version != null && version > 1) {
      setSampleX((sx) => {
        sx.delete(version - 1);
        return sx;
      });
      setPoints((p) => {
        p.delete(version - 1);
        return p;
      });
    }
  }, [minX, maxX, minY, maxY, version]);

  const placePoint = useCallback(
    (x: number, y: number): [number, number] => {
      return [
        x * xScale + width / 2,
        height - (y * yScale + height / 2) + margin,
      ];
    },
    [height, width, xScale, yScale]
  );

  useEffect(() => {
    (async () => {
      if (version == null) {
        return;
      }
      const arg = sampleX.get(version) || minX;
      if (arg.compare(maxX) <= 0) {
        const originalY = await fn(arg);
        if (originalY != null) {
          const [x, y] = placePoint(arg.valueOf(), originalY.valueOf());
          setPoints((p) => {
            if (version != null) {
              const currentPath = p.get(version) ?? '';
              const newPath = currentPath
                ? `${currentPath} L${x},${y}`
                : `M${x},${y}`;
              p.set(version, newPath);
            }
            return p;
          });
        }
        setSampleX((sx) => {
          sx.set(version, arg.add(sampleInterval));
          setInternalVersion((iv) => iv + 1);
          return sx;
        });
      } else {
        onFinishRender(version, !!points.get(version));
      }
    })();
  }, [
    fn,
    maxX,
    minX,
    placePoint,
    sampleInterval,
    sampleX,
    version,
    internalVersion,
    onFinishRender,
    points,
  ]);

  return (
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
          d={(version != null && points.get(version)) || ''}
        />
      </g>
    </svg>
  );
};
