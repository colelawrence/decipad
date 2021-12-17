import { useEffect, useState } from 'react';
import { DecoratorFn } from '@storybook/react';
import { Result } from '@decipad/language';
import { runCode } from '../test-utils';

type CodeDecoratorFactory = (code: string) => DecoratorFn;

export const withCode: CodeDecoratorFactory = (code: string) => (Story) => {
  const [resultProps, setResultProps] = useState<Result | null>(null);

  useEffect(() => {
    (async () => {
      setResultProps(await runCode(code));
    })();
  }, []);

  return resultProps == null ? <div /> : <Story args={resultProps} />;
};
