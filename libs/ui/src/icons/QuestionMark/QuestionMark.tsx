import { css } from '@emotion/react';

const questionMarkStyles = css({
  width: '24px',
});

export const QuestionMark = () => (
  <span title="Unknown" css={questionMarkStyles}>
    ?
  </span>
);
