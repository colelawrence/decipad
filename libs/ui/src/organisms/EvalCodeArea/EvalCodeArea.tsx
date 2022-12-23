import { css } from '@emotion/react';
import React from 'react';
import { code, cssVar } from '../../primitives';

export const EvalCodeArea: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <div css={containerStyles} spellCheck={false}>
      {props.children}
    </div>
  );
};

const containerStyles = css(code, {
  gridArea: 'code',

  marginTop: '16px',
  padding: '4px 10px',
  borderRadius: '10px',
  border: `1px solid ${cssVar('borderColor')}`,
});
