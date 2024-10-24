import { FC } from 'react';
import styled from '@emotion/styled';
import { cssVar, p14Regular } from '../../primitives';
import { DataSet } from '../../icons/DataSet';

export const EmptyDataSet: FC = () => {
  return (
    <EmptyDataSetStyled>
      <div>
        <DataSet />
      </div>
      <p>No selected data sets</p>
      <p>When you select a dataset or CSV they will show up here</p>
    </EmptyDataSetStyled>
  );
};

const EmptyDataSetStyled = styled.div({
  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'column',

  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '16px',
  border: `1px solid ${cssVar('borderDefault')}`,

  'div:first-child': {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: cssVar('backgroundSubdued'),
  },

  p: p14Regular,

  'p:first-child': {
    color: cssVar('textTitle'),
  },

  'p:last-child': {
    color: cssVar('textSubdued'),
  },
});
