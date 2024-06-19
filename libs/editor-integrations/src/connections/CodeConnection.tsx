/* eslint-disable no-param-reassign */
import type { FC } from 'react';
import { useState } from 'react';
import { CodeEditor, TextAndIconButton } from '@decipad/ui';
import type { ConnectionProps } from './types';
import { CodeRunner } from '../runners';
import { useExecutionContext, useResourceUsage } from '@decipad/react-contexts';
import { Play } from 'libs/ui/src/icons/Play';
import { assertInstanceOf } from '@decipad/utils';

export const CodeConnection: FC<ConnectionProps> = ({ runner, onRun }) => {
  assertInstanceOf(runner, CodeRunner);

  const [code, setCode] = useState(runner.code);
  const { info, onExecute } = useExecutionContext();
  const { queries } = useResourceUsage();

  return (
    <div css={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <CodeEditor
        lang="javascript"
        code={code}
        setCode={(newCode) => {
          runner.code = newCode;
          setCode(newCode);
        }}
        log={info}
        setLog={onExecute}
      />
      <TextAndIconButton
        text="Run"
        size="normal"
        iconPosition="left"
        color="brand"
        onClick={onRun}
        disabled={queries.hasReachedLimit}
      >
        <Play />
      </TextAndIconButton>
    </div>
  );
};
