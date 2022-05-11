import { Result } from '@decipad/computer';
import { css } from '@emotion/react';
import { Loading } from '../../icons';
import { CodeResult } from '../../organisms';

type MagicNumberProps = {
  readonly result?: Result | null;
};

export const MagicNumber = ({
  result,
}: MagicNumberProps): ReturnType<React.FC> => {
  return (
    <span
      css={css({
        display: 'inline-flex',
      })}
    >
      <span
        title={result ? result.value?.toString() : 'Loading'}
        contentEditable={false}
      >
        {result ? (
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
