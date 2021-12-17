import { css } from '@emotion/react';
import { SerializedTypeKind } from '@decipad/language';
import { code, cssVar, p12Regular, setCssVar } from '../../primitives';
import { ResultProps } from '../../lib/results';
import { CodeResult } from '..';

const styles = css(p12Regular, {
  ...setCssVar('normalTextColor', cssVar('weakTextColor')),

  lineHeight: code.lineHeight,
  padding: '8.5px 0',

  // Truncates text
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

type InlineCodeResultProps = Pick<
  ResultProps<SerializedTypeKind>,
  'type' | 'value'
>;

export const InlineCodeResult = ({
  value,
  type,
}: InlineCodeResultProps): ReturnType<React.FC> => {
  return (
    <div css={styles}>
      <CodeResult value={value} variant="inline" type={type} />
    </div>
  );
};
