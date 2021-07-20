import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
  getPreventDefaultHandler,
  PortalBody,
  SPEditor,
  useEventEditorId,
  useStoreEditorRef,
} from '@udecode/slate-plugins';
import React, { useEffect, useRef } from 'react';
import { Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { Command } from '../commands';

const Wrapper = styled.div`
  position: absolute;
  left: -9999px;
  top: -9999px;
  border-radius: 6px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #f0f0f2;
  padding: 6px 6px 0px 6px;
  box-shadow: 0px 2px 24px -4px rgba(36, 36, 41, 0.06);
`;

const OptionItem = styled.div<{ active: boolean }>`
  width: 256px;
  height: 52px;
  display: flex;
  padding: 6px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  transition: 0.2s cubic-bezier(0.445, 0.05, 0.55, 0.95);
  ${(props) =>
    props.active &&
    css`
      background-color: #f0f0f2;
    `};
`;

const OptionLayout = styled.div`
  display: flex;
  width: 100%;
`;

const OptionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 40px;
  background-color: #ffffff;
  border: 1px solid #f0f0f2;
  border-radius: 6px;
  margin-right: 6px;
  transition: 0.2s cubic-bezier(0.445, 0.05, 0.55, 0.95);
`;

interface SlashCommandsSelectProps {
  options: Command[];
  at: Range | null;
  onClickSlashCommands: (editor: SPEditor, data: Command) => void;
  valueIndex: number;
}

export const SlashCommandsSelect = ({
  options,
  at,
  onClickSlashCommands,
  valueIndex,
}: SlashCommandsSelectProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  useEffect(() => {
    if (editor && at && options.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, at);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [options.length, editor, at]);

  if (!editor || !at || !options.length) {
    return null;
  }

  return (
    <PortalBody>
      <Wrapper ref={ref}>
        {options.map((option, i) => (
          <OptionItem
            key={`${i}${option.type}`}
            active={i === valueIndex}
            onMouseDown={getPreventDefaultHandler(
              onClickSlashCommands,
              editor,
              option
            )}
          >
            <OptionLayout>
              <OptionIcon>{option.icon}</OptionIcon>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <p style={{ fontWeight: 'bold', paddingBottom: '3px' }}>
                  {option.name}
                </p>
                <p style={{ fontSize: '12px', color: '#89898E' }}>
                  {option.description}
                </p>
              </div>
            </OptionLayout>
          </OptionItem>
        ))}
      </Wrapper>
    </PortalBody>
  );
};
