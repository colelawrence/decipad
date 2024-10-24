/* eslint-disable no-param-reassign */
import type { FC } from 'react';
import { useState } from 'react';
import {
  CodeEditor,
  TabsContent,
  TabsRoot,
  TextAndIconButton,
  TabsList,
  TabsTrigger,
  LiveCode,
  ContentEditableInput,
} from '@decipad/ui';
import { useResourceUsage } from '@decipad/react-contexts';
import { Play } from 'libs/ui/src/icons/Play';
import { assertInstanceOf } from '@decipad/utils';
import { ConnectionProps } from '../types';
import styled from '@emotion/styled';
import { CodeRunner } from '../../runners';
import { codePlaceholder } from '@decipad/editor-utils';
import { PortalledPreview } from '../ResultPreview';
import { css } from '@emotion/react';

const AVAILABLE_TABS = [
  { id: 'code', label: 'Code' },
  { id: 'preview', label: 'Preview' },
] as const;

export const CodeConnection: FC<ConnectionProps> = (props) => {
  const { runner, onRun } = props;
  assertInstanceOf(runner, CodeRunner);

  const [code, setCode] = useState(
    runner.options.runner.code ?? codePlaceholder()
  );
  const { queries } = useResourceUsage();

  return (
    <CodeConnectionWrapper>
      <TabsRoot defaultValue="code" styles={css({ display: 'contents' })}>
        <TabsList fullWidth>
          {AVAILABLE_TABS.map((tab) => {
            return (
              <TabsTrigger
                name={tab.id}
                key={tab.id}
                trigger={{ label: tab.label }}
              />
            );
          })}
        </TabsList>
        <TabsContent name="code">
          <CodeEditor
            lang="javascript"
            code={code}
            setCode={(newCode) => {
              runner.setOptions({ runner: { code: newCode } });
              setCode(newCode);
            }}
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
        </TabsContent>
        <TabsContent name="preview">
          <PortalledPreview
            {...props}
            varNameInput={
              props.type === 'create' && (
                <LiveCode type="table" meta={[]}>
                  <ContentEditableInput
                    value={props.varName}
                    onChange={props.onChangeVarName}
                  />
                </LiveCode>
              )
            }
          />
        </TabsContent>
      </TabsRoot>
    </CodeConnectionWrapper>
  );
};

const CodeConnectionWrapper = styled.div({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  '[role=tabpanel]': {
    display: 'contents',
  },
});
