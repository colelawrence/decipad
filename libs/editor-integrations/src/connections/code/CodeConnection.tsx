/* eslint-disable no-param-reassign */
import type { FC } from 'react';
import { useState } from 'react';
import {
  CodeEditor,
  TextAndIconButton,
  SegmentButtons,
  StatusLine,
} from '@decipad/ui';
import { useResourceUsage } from '@decipad/react-contexts';
import { Play } from 'libs/ui/src/icons/Play';
import { assertInstanceOf } from '@decipad/utils';
import { ConnectionProps } from '../types';
import styled from '@emotion/styled';
import { codePlaceholder } from '@decipad/editor-utils';
import { SplitPreview } from '../SplitPreview';
import { CodeRunner } from '@decipad/notebook-tabs';

export const CodeConnection: FC<ConnectionProps> = (props) => {
  const { runner, onRun } = props;
  assertInstanceOf(runner, CodeRunner);

  const [code, setCode] = useState(
    runner.options.runner.code ?? codePlaceholder()
  );
  const { queries } = useResourceUsage();

  return (
    <CodeConnectionWrapper>
      <SplitPreview conn={props}>
        <header>
          <SegmentButtons
            buttons={[
              {
                children: (
                  <TextAndIconButton
                    text="Run"
                    size="fit"
                    color="default"
                    iconPosition="left"
                    disabled={queries.hasReachedLimit}
                  >
                    <Play />
                  </TextAndIconButton>
                ),
                onClick: onRun,
              },
            ]}
          />
        </header>
        <CodeEditor
          lang="javascript"
          code={code}
          setCode={(newCode) => {
            runner.setOptions({ runner: { code: newCode } });
            setCode(newCode);
          }}
        />
        <footer>
          <StatusLine type="javascript" logs={props.info} />
        </footer>
      </SplitPreview>
    </CodeConnectionWrapper>
  );
};

const CodeConnectionWrapper = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignItems: 'end',
  position: 'relative',
  header: {
    position: 'absolute',
    top: '0',
    right: '0',
    zIndex: '100',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'end',
  },
});
