import { Button, cssVar, shortAnimationDuration } from '@decipad/ui';
import { FC, PropsWithChildren, useRef, useState } from 'react';
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { PortalledPreview } from './ResultPreview';
import styled from '@emotion/styled';
import { ConnectionProps } from './types';
import { css } from '@emotion/react';
import { deciOverflowStyles } from 'libs/ui/src/styles/scrollbars';

export type SplitPreviewProps = PropsWithChildren<{
  conn: ConnectionProps;
}>;
export const SplitPreview: FC<SplitPreviewProps> = ({ conn, children }) => {
  const previewPanel = useRef<ImperativePanelHandle>(null);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <PanelGroup direction="horizontal">
      <Panel css={PanelStyle} minSize={10}>
        {children}
        <ExpandResult data-visible={collapsed ? '1' : '0'}>
          <Button
            size="extraSlim"
            type="secondary"
            aria-label="Expand preview panel"
            onClick={() => {
              previewPanel.current?.expand();
            }}
          >
            &lt;
          </Button>
        </ExpandResult>
      </Panel>
      <PanelResizeHandle css={PanelResizeHandleStyle} />
      <Panel
        css={PanelStyle}
        collapsible
        minSize={20}
        ref={previewPanel}
        onExpand={() => {
          setCollapsed(false);
        }}
        onCollapse={() => {
          setCollapsed(true);
        }}
      >
        <PanelContainer>
          <PortalledPreview {...conn} varNameInput={<></>} />
        </PanelContainer>
      </Panel>
    </PanelGroup>
  );
};
const ExpandResult = styled.div({
  position: 'absolute',
  top: 'calc(50% - 16px)',
  right: '-48px',
  margin: '8px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  transition: `right ${shortAnimationDuration} ease-in-out`,
  '&[data-visible="1"]': {
    right: '0',
  },
  '> *': {
    width: '100%',
    height: '100%',
    padding: '0',
    margin: '0',
  },
});

const PanelResizeHandleStyle = css({
  // width: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '::after': {
    content: '" "',
    display: 'inline-block',
    maxHeight: '5em',
    height: '100%',
    width: '4px',
    margin: '0 4px',
    background: cssVar('borderDefault'),
  },
});
const PanelContainer = styled.div(deciOverflowStyles, {
  display: 'flex',
  width: '100%',
  height: '100%',
  '& > *, & > * > *': {
    margin: 'auto',
  },
});
const PanelStyle = css({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: '16px',
  border: `1px solid ${cssVar('borderDefault')}`,
  '&[data-panel-size="0.0"]': {
    border: 'none',
  },
});
