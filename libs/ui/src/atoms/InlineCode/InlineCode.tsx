import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { codeBlock } from '../../styles';

const styles = css(codeBlock.variableStyles, {
  margin: '0 6px',
  padding: `4px`,

  borderRadius: '4px',
});

interface InlineCodeProps {
  readonly children: ReactNode;
}
export const InlineCode = ({
  children,
}: InlineCodeProps): ReturnType<React.FC> => {
  return <code css={styles}>{children}</code>;
};
