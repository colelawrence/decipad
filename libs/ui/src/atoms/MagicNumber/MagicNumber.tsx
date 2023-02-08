import { Result } from '@decipad/computer';
import { AnyElement } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Loading } from '../../icons';
import { CodeResult } from '../../organisms';
import { cssVar } from '../../primitives';
import { resultBubbleStyles } from '../../styles/results';
import { useEventNoEffect } from '../../utils/useEventNoEffect';
import { Tooltip } from '../Tooltip/Tooltip';

type MagicNumberProps = {
  readonly tempId?: string;
  readonly result?: Result.Result | undefined;
  readonly loadingState?: boolean;
  readOnly?: boolean;
  readonly onClick?: () => void;
  readonly setPointyStyles?: boolean;
  readonly expression?: string;
  readonly element?: AnyElement;
};

const wrapperStyles = css({
  display: 'inline-flex',
  cursor: 'pointer',
});

const highlightStyles = css(resultBubbleStyles, {
  display: 'inline-block',
  color: cssVar('magicNumberTextColor'),
  padding: 2,
  '@media print': {
    color: 'unset',
  },
});

interface ResultResultProps {
  children?: ReactNode;
  readOnly: boolean;
  expression?: string;
}

const IntrospectMagicNumber: FC<ResultResultProps> = ({
  expression,
  readOnly,
  children,
}) => {
  return (
    <Tooltip trigger={<span>{children}</span>}>
      {expression?.startsWith('exprRef_') && !readOnly ? (
        <p>Click to edit</p>
      ) : readOnly ? (
        `Live Result`
      ) : (
        // legacy magic numbers catch
        <span>
          Formula: <pre>{expression}</pre>
        </span>
      )}
    </Tooltip>
  );
};

export const MagicNumber = ({
  tempId,
  result,
  loadingState = false,
  readOnly = false,
  onClick = noop,
  expression,
  element,
}: MagicNumberProps): ReturnType<React.FC> => {
  const hasResult = !!result && !loadingState;
  const noEffectOnClick = useEventNoEffect(onClick);

  return (
    <span
      onClick={readOnly ? noop : noEffectOnClick}
      css={[wrapperStyles]}
      data-number-id={tempId}
      id={tempId}
      data-testid="magic-number"
    >
      <span
        title={result ? result.value?.toString() : 'Loading'}
        contentEditable={false}
      >
        <IntrospectMagicNumber expression={expression} readOnly={readOnly}>
          {hasResult ? (
            <span css={highlightStyles}>
              <CodeResult
                tooltip={false}
                variant="inline"
                {...result}
                element={element}
              />
            </span>
          ) : (
            <span
              css={css({
                paddingTop: '3px',
                minHeight: '19px',
                display: 'inline-block',
                margin: 'auto',
                '> svg': { height: '16px', display: 'block', margin: '0 auto' },
              })}
            >
              <Loading />
            </span>
          )}
        </IntrospectMagicNumber>
      </span>
    </span>
  );
};
