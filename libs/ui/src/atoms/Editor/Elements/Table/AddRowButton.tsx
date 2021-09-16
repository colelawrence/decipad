import { css } from '@emotion/react';
import {
  getPreventDefaultHandler,
  SPEditor,
  useEventEditorId,
  useStoreEditorState,
} from '@udecode/plate';
import { FC } from 'react';
import { Create } from '../../../../icons';
import { addRow } from './utils/addRow';

const addRowButtonStyles = css({
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #ECF0F6',
  width: '100%',
  fontFamily: 'monospace',
  borderTop: 'none',
  backgroundColor: '#fff',
  height: '35px',
  paddingLeft: '12px',
  fontSize: '14px',
  color: '#777E89',
  cursor: 'pointer',
  gap: '6px',
  '> svg': {
    fill: '#777E89',
    stroke: '#777E89',
  },
});

const iconSize = css({
  width: '16px',
  height: '16px',
  marginRight: '6px',
});

export const AddRowButton = (): ReturnType<FC> => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  return (
    <button
      contentEditable={false}
      css={addRowButtonStyles}
      onMouseDown={getPreventDefaultHandler(addRow, editor as SPEditor)}
    >
      <span css={iconSize}>
        <Create />
      </span>{' '}
      Add row
    </button>
  );
};
