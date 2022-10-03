import { css } from '@emotion/react';
import { Divider } from '../../atoms';

const styles = css({});

export const DividerBlock: React.FC = () => {
  return (
    <div css={styles}>
      <Divider />
    </div>
  );
};
