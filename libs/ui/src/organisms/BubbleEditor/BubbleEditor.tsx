import React from 'react';
import { css } from '@emotion/react';
import { useEditorBubblesContext } from '@decipad/react-contexts';
import { BubbleFormula } from '@decipad/editor-types';
import { Close } from '../../icons';
import {
  brand100,
  cssVar,
  grey300,
  p12Medium,
  purple500,
} from '../../primitives';
import { CodeResult } from '../CodeResult/CodeResult';

export const BubbleEditor: React.FC<{
  onClose(): void;
  defaultName: string;
  defaultExpr: string;
  onChange(value: Partial<BubbleFormula>): void;
}> = (props) => {
  const bubbles = useEditorBubblesContext();

  if (!bubbles.editing) return null;

  const { codeResult } = bubbles;

  return (
    <div css={bubbleEditorContainer}>
      <div css={bubbleEditorStyles}>
        <textarea
          css={bubbleTextField}
          defaultValue={props.defaultExpr}
          onKeyUp={(ev) =>
            props.onChange({
              expression: ev.currentTarget.value,
            })
          }
          rows={1}
        />

        <div css={bubbleFooterRow}>
          <div css={bubbleName}>
            <div css={bubbleInputLabel}>Name</div>
            <input
              css={bubbleNameInput}
              defaultValue={props.defaultName}
              onKeyUp={(ev) =>
                props.onChange({
                  name: ev.currentTarget.value,
                })
              }
            />
          </div>
          <div css={bubbleResult}>
            <div css={bubbleInputLabel}>Result</div>
            <div css={bubbleResultArea}>
              {codeResult && <CodeResult variant="inline" {...codeResult} />}
            </div>
          </div>
        </div>

        <div css={temporaryCloseBtn} onClick={props.onClose}>
          <Close />
        </div>
      </div>
    </div>
  );
};

const borderStyle = `1px solid ${cssVar('strongHighlightColor')}`;

const temporaryCloseBtn = css({
  height: '24px',
  width: '24px',
  right: '4px',
  top: '-24px',
  position: 'absolute',
  cursor: 'pointer',
});

const bubbleTextField = css({
  width: '100%',
  borderBottom: borderStyle,
  padding: '16px 24px 16px 40px',
  background: 'transparent',
});

const bubbleEditorContainer = css({
  position: 'fixed',
  bottom: 0,
  left: 0,

  display: 'flex',
  width: '100vw',
  justifyContent: 'center',
});

const bubbleEditorStyles = css({
  position: 'relative',
  width: '700px',

  border: borderStyle,
  borderRadius: '8px 8px 0 0',
  background: cssVar('backgroundColor'),

  ':before': {
    content: '"="',
    color: purple500.rgb,
    position: 'absolute',
    left: '24px',
    top: '16px',
  },
});

const bubbleFooterRow = css({
  padding: '12px 24px 21px',
  columnGap: '16px',

  display: 'flex',
  flexDirection: 'row',
});

const bubbleInputLabel = css({
  ...p12Medium,
});

const bubbleName = css({
  flex: 1,
});

const bubbleNameInput = css({
  height: '42px',
  width: '100%',
  borderRadius: '5px',
  background: brand100.rgb,

  paddingLeft: '12px',
  paddingRight: '12px',
});

const bubbleResult = css({
  minWidth: '104px',
});

const bubbleResultArea = css({
  height: '42px',
  width: '100%',
  borderRadius: '5px',
  background: grey300.rgb,

  paddingLeft: '12px',
  paddingRight: '12px',

  display: 'flex',
  alignItems: 'center',
});
