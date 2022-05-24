import { Result } from '@decipad/computer';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Loading } from '../../icons';
import { CodeResult } from '../../organisms';
import { cssVar } from '../../primitives';

type MagicNumberProps = {
  readonly result?: Result | null;
  readonly loadingState?: boolean;
  readOnly?: boolean;
  readonly onClick?: () => void;
  readonly setPointyStyles?: boolean;
};

const wrapperStyles = css({
  display: 'inline-flex',
  cursor: 'pointer',
});

const baseCreatorStyles = css({
  color: cssVar('variableHighlightTextColor'),
});

export const MagicNumber = ({
  result,
  loadingState = false,
  readOnly = false,
  onClick = noop,
}: MagicNumberProps): ReturnType<React.FC> => {
  return (
    <span
      onClick={onClick}
      css={[wrapperStyles, !readOnly && baseCreatorStyles]}
    >
      <span
        title={result ? result.value?.toString() : 'Loading'}
        contentEditable={false}
      >
        {result && !loadingState ? (
          <CodeResult variant="inline" {...result} />
        ) : (
          <span
            css={css({
              margin: 'auto',
              '> svg': { height: '16px', display: 'block', margin: '0 auto' },
            })}
          >
            <Loading />
          </span>
        )}
      </span>
    </span>
  );
};
