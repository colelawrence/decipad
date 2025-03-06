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
      <p>No data set to preview</p>
      <p>Query a data set or upload a CSV</p>
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
  textAlign: 'center',

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
    padding: '0 10%',
  },
});
