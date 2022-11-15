import { css } from '@emotion/react';
import { FC } from 'react';
import {
  BooleanCheckboxSelected,
  BooleanCheckboxUnselected,
} from '../../icons';
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
    <span
      data-highlight-changes
      css={booleanResultStyles}
      contentEditable={false}
    >
      {value ? <BooleanCheckboxSelected /> : <BooleanCheckboxUnselected />}
    </span>
  );
};
