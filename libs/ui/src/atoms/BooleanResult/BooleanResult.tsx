import { css } from '@emotion/react';
import { FC } from 'react';
import { CheckboxSelected, CheckboxUnselected } from '../../icons';
import { CodeResultProps } from '../../types';

const numberResultStyles = css({
  wordBreak: 'break-all',
  '> svg': {
    width: '16px',
    height: '16px',
  },
});

export const BooleanResult = ({
  value,
}: CodeResultProps<'boolean'>): ReturnType<FC> => {
  return (
    <span css={numberResultStyles} contentEditable={false}>
      {value ? <CheckboxSelected /> : <CheckboxUnselected />}
    </span>
  );
};
