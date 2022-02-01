import { useEffect, useState } from 'react';
import { DecoratorFn } from '@storybook/react';
import { Result, SerializedTypeKind } from '@decipad/language';
import { runCode } from '../test-utils';

type CodeDecoratorFactory = (code: string) => DecoratorFn;

export type WithCodeProps<T extends SerializedTypeKind> = Result<T>;

export const withCode: CodeDecoratorFactory =
  (code: string) => (Story, context) => {
    const [resultProps, setResultProps] = useState<Result | null>(null);

    useEffect(() => {
      (async () => {
        setResultProps(await runCode(code));
      })();
    }, []);

    return resultProps == null ? (
      <div />
    ) : (
      <Story args={{ ...context.args, ...resultProps }} />
    );
  };
