import { Result, SerializedTypeKind } from '@decipad/remote-computer';
import { Decorator, StoryContext, StoryFn } from '@storybook/react';
import { useEffect, useState } from 'react';
import { runCode } from '../test-utils';

type CodeDecoratorFactory = (code: string, asResult?: boolean) => Decorator;

export type WithCodeProps<T extends SerializedTypeKind> = Result.Result<T>;

export const withCode: CodeDecoratorFactory =
  (code: string, asResult = false) =>
  (Story: StoryFn, context: StoryContext) => {
    const [resultProps, setResultProps] = useState<Result.Result | null>(null);

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
