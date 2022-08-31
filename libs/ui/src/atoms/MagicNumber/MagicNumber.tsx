import { Result } from '@decipad/computer';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Loading } from '../../icons';
import { CodeResult } from '../../organisms';
import { cssVar } from '../../primitives';
import { Tooltip } from '../Tooltip/Tooltip';

type MagicNumberProps = {
  readonly result?: Result.Result | undefined;
  readonly loadingState?: boolean;
  readOnly?: boolean;
  readonly onClick?: () => void;
  readonly setPointyStyles?: boolean;
  readonly expression?: string;
};

const wrapperStyles = css({
  display: 'inline-flex',
  cursor: 'pointer',
});

const baseCreatorStyles = css({
  color: cssVar('variableHighlightTextColor'),
});

interface ResultResultProps {
  children?: ReactNode;
  expression?: string;
}

const IntrospectMagicNumber: FC<ResultResultProps> = ({
  expression,
  children,
}) => {
  return (
    <Tooltip trigger={children}>
      expression: <pre>{expression}</pre>
    </Tooltip>
  );
};

export const MagicNumber = ({
  result,
  loadingState = false,
  readOnly = false,
  onClick = noop,
  expression,
}: MagicNumberProps): ReturnType<React.FC> => {
  const hasResult = !!result && !loadingState;
  return (
    <span
      onClick={onClick}
      css={[wrapperStyles, !readOnly && baseCreatorStyles]}
    >
      <span
        title={result ? result.value?.toString() : 'Loading'}
        contentEditable={false}
      >
        {hasResult ? (
          <CodeResult variant="inline" {...result} />
        ) : (
          <IntrospectMagicNumber expression={expression}>
            <span
              css={css({
                margin: 'auto',
                '> svg': { height: '16px', display: 'block', margin: '0 auto' },
              })}
            >
              <Loading />
            </span>
          </IntrospectMagicNumber>
        )}
      </span>
    </span>
  );
};
