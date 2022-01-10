import { css } from '@emotion/react';
import { ReactNode } from 'react';

const styles = css({ fontStyle: 'italic' });

interface ItalicProps {
  readonly children: ReactNode;
}
export const Italic = ({ children }: ItalicProps): ReturnType<React.FC> => {
  return <span css={styles}>{children}</span>;
};
