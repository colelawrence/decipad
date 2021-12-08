import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { SlateLeafProps } from '../../utils';

const styles = css({ fontStyle: 'italic' });

interface ItalicProps extends SlateLeafProps {
  readonly children: ReactNode;
}
export const Italic = ({ children }: ItalicProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
