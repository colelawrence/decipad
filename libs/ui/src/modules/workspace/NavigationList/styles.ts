import styled from '@emotion/styled';
import { deciOverflowYStyles } from 'libs/ui/src/styles/scrollbars';

type ListProps = {
  level: number;
};

export const List = styled.ul<ListProps>((props) => [
  {
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: 4,
  },
  props.level > 0 && [
    {
      maxHeight: 240,
    },
    deciOverflowYStyles,
  ],
]);

export const Item = styled.li({
  display: 'flex',
  margin: 0,
  padding: 0,

  '& > a': {
    width: '100%',
    display: 'flex',
  },
});
