import Fraction, { isFractionLike, toFraction } from '@decipad/fraction';
import { useComputer } from '@decipad/react-contexts';
import { dequal } from 'dequal';
import { FC, useCallback, useEffect, useState } from 'react';
import type { AST } from '@decipad/computer';
import { debounceTime } from 'rxjs';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { DefaultFunctionResult, PlotFunction } from '../../atoms';
import { CodeResultProps } from '../../types';

type FunctionResultProps = CodeResultProps<'function'>;

const defaultMaxX = toFraction(10);
const defaultMaxY = toFraction(2);
const maxMaxX = toFraction(9999999999n);
const xStep = toFraction(10);

export const FunctionResult: FC<FunctionResultProps> = ({ type }) => {
  const computer = useComputer();
  const [version, setVersion] = useState<number | undefined>();
  const [maxX, setMaxX] = useState(defaultMaxX);
  const [maxY, setMaxY] = useState(defaultMaxY);
  const [hightestVariance, setHighestVariance] = useState(0);
  const [hightestVarianceMaxX, setHighestVarianceMaxX] = useState(maxX);
  const [lastFunctionAst, setLastFunctionAst] = useState<
    AST.Node | null | undefined
  >();
  const [finishedRenderVersion, setFinishedRenderVersion] = useState(false);
  const [settled, setSettled] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const sub = computer.getFunctionDefinition$
      .observe(type.name)
      .pipe(debounceTime(1000))
      .subscribe((def) => {
        if (def && !dequal(def, lastFunctionAst)) {
          setLastFunctionAst(def);
          setVersion((v) => (v || 0) + 1);
        }
      });

    return () => sub.unsubscribe();
  }, [computer, lastFunctionAst, type.name]);

  useEffect(() => {
    setMaxX(defaultMaxX);
    setMaxY(defaultMaxY);
    setHighestVariance(0);
    setHighestVarianceMaxX(defaultMaxX);
    setFallback(false);
    setFinishedRenderVersion(false);
    setSettled(false);
  }, [lastFunctionAst]);

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
        const resN = toFraction(value);
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

  const onFinishRender = useCallback(
    (renderedVersion: number, variance: number) => {
      if (renderedVersion !== version) {
        return;
      }
      if (finishedRenderVersion) {
        return;
      }
      if (hightestVariance > variance) {
        // record maximum variance achieved
        setHighestVariance(hightestVariance);
        setHighestVarianceMaxX(maxX);
      }
      setFinishedRenderVersion(true);
    },
    [finishedRenderVersion, hightestVariance, maxX, version]
  );

  useEffect(() => {
    if (finishedRenderVersion && !settled) {
      if (hightestVariance === 0 && maxX.compare(maxMaxX) < 0) {
        setMaxX(maxX.mul(xStep.pow(version || 1)));
      } else if (maxX.compare(hightestVarianceMaxX) !== 0) {
        // no need to keep searching, just use the max x
        setMaxX(hightestVarianceMaxX);
        setSettled(true);
      } else {
        setFallback(true);
      }
    }
  }, [
    finishedRenderVersion,
    hightestVariance,
    hightestVarianceMaxX,
    maxX,
    settled,
    version,
  ]);

  if (
    type.kind === 'function' &&
    type.argCount === 1 &&
    !fallback &&
    version != null
  ) {
    return (
      <ReactErrorBoundary
        fallbackRender={() => <DefaultFunctionResult />}
        onError={console.error}
      >
        <PlotFunction
          height={25}
          width={50}
          fn={fn}
          maxX={maxX}
          maxY={maxY}
          version={version}
          onFinishRender={onFinishRender}
        />
      </ReactErrorBoundary>
    );
  }
  return <DefaultFunctionResult />;
};
