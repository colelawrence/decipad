import Fraction, { isFractionLike } from '@decipad/fraction';
import { useComputer } from '@decipad/react-contexts';
import { FC, useCallback, useEffect, useState } from 'react';
import { debounceTime } from 'rxjs';
import { PlotFunction } from '../../atoms';
import { CodeResultProps } from '../../types';

type FunctionResultProps = CodeResultProps<'function'>;

const DefaultFunctionResult = () => <span>ƒ</span>;

const defaultMinX = new Fraction(-10);
const defaultMaxX = new Fraction(10);
const defaultMaxY = new Fraction(2);

export const FunctionResult: FC<FunctionResultProps> = ({ type }) => {
  const computer = useComputer();
  const [version, setVersion] = useState<number | undefined>();
  const [minX, setMinX] = useState(defaultMinX);
  const [maxX, setMaxX] = useState(defaultMaxX);
  const [maxY, setMaxY] = useState(defaultMaxY);

  useEffect(() => {
    const sub = computer
      .expressionResult$(
        {
          type: 'ref',
          args: [type.name],
        },
        { version: true }
      )
      .pipe(debounceTime(1000))
      .subscribe((r) => {
        setVersion(r.version);
      });

    return () => sub.unsubscribe();
  }, [computer, type.name]);

  useEffect(() => {
    setMinX(defaultMinX);
    setMaxX(defaultMaxX);
    setMaxY(defaultMaxY);
    setFallback(false);
  }, [version]);

  const fn = useCallback(
    async (n: Fraction): Promise<Fraction | undefined> => {
      const res = await computer.expressionResult({
        type: 'function-call',
        args: [
          {
            type: 'funcref',
            args: [type.name],
          },
          {
            type: 'argument-list',
            args: [
              {
                type: 'literal',
                args: ['number', n],
              },
            ],
          },
        ],
      });
      const { type: resType, value } = res;
      if (resType.kind === 'number' && isFractionLike(value)) {
        const resN = new Fraction(value);
        const absResN = resN.abs();
        if (maxY.compare(absResN) < 0) {
          setMaxY(absResN);
        }
        return resN;
      }
      return undefined;
    },
    [computer, maxY, type.name]
  );

  const [fallback, setFallback] = useState(false);

  const onFinishRender = useCallback(
    (renderedVersion: number, hasValues: boolean) => {
      if (version === renderedVersion && !hasValues) {
        setFallback(true);
      }
    },
    [version]
  );

  if (type.kind === 'function' && type.argCount === 1 && !fallback) {
    return (
      <PlotFunction
        height={25}
        width={50}
        fn={fn}
        minX={minX}
        maxX={maxX}
        minY={maxY.neg()}
        maxY={maxY}
        version={version}
        onFinishRender={onFinishRender}
      />
    );
  }
  return <DefaultFunctionResult />;
};
