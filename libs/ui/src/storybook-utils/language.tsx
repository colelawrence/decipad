import { Result, SerializedTypeKind } from '@decipad/computer';
import { DecoratorFn } from '@storybook/react';
import { useEffect, useState } from 'react';
import { runCode } from '../test-utils';

type CodeDecoratorFactory = (code: string, asResult?: boolean) => DecoratorFn;

export type WithCodeProps<T extends SerializedTypeKind> = Result<T>;

export const withCode: CodeDecoratorFactory =
  (code: string, asResult = false) =>
  (Story, context) => {
    const [resultProps, setResultProps] = useState<Result | null>(null);

    useEffect(() => {
      (async () => {
        setResultProps(await runCode(code));
      })();
    }, []);

    return resultProps == null ? (
      <div />
    ) : asResult ? (
      <Story args={{ ...context.args, result: resultProps }} />
    ) : (
      <Story args={{ ...context.args, ...resultProps }} />
    );
  };
