import { css } from '@emotion/react';
import { FC } from 'react';
import { CheckboxSelected, CheckboxUnselected } from '../../icons';
import { CodeResultProps } from '../../types';

const booleanResultStyles = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',

  '> svg': {
    width: '16px',
    height: '16px',
  },
});

export const BooleanResult = ({
  value,
}: CodeResultProps<'boolean'>): ReturnType<FC> => {
  return (
    <span css={booleanResultStyles} contentEditable={false}>
      {value ? <CheckboxSelected /> : <CheckboxUnselected />}
    </span>
  );
};
