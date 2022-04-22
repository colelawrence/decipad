import { css } from '@emotion/react';
import { Divider } from '../../atoms';
import { dividerBlock } from '../../styles/block-alignment';

const styles = css({
  paddingTop: dividerBlock.paddingTop,
  height: dividerBlock.height,
});

export const DividerBlock: React.FC = () => {
  return (
    <div css={styles}>
      <Divider />
    </div>
  );
};
