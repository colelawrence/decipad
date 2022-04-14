import { css } from '@emotion/react';
import { Divider } from '../../atoms';
import { divider } from '../../styles/block-alignment';

const styles = css({
  padding: `${divider.paddingTop} 0`,
});

export const DividerBlock: React.FC = () => {
  return (
    <div css={styles}>
      <Divider />
    </div>
  );
};
