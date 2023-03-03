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
  /** Is this magic number pointing to an expression reference? */
  readonly isReference?: boolean;
};

const wrapperStyles = css({
  display: 'inline-flex',
  cursor: 'pointer',
});

const highlightStyles = (isReference: boolean, readOnly: boolean) =>
  css([
    resultBubbleStyles,
    {
      display: 'inline-block',
      color: cssVar('magicNumberTextColor'),
      padding: '1px 6px 0px 6px',
      lineHeight: '1.3',
      '@media print': {
        color: 'unset',
      },
    },
    !isReference && {
      color: cssVar('normalTextColor'),
    },
    !isReference &&
      readOnly && {
        padding: 0,
        border: 'unset',
        filter: 'unset',
        cursor: 'text',
      },
  ]);

interface ResultResultProps {
  children?: ReactNode;
  readOnly: boolean;
  isReference: boolean;
  expression?: string;
}

const IntrospectMagicNumber: FC<ResultResultProps> = ({
  isReference,
  readOnly,
  children,
}) => {
  if (!isReference && readOnly) {
    return <span>{children}</span>;
  }
  return (
    <Tooltip trigger={<span>{children}</span>}>
      {readOnly ? 'Live result' : <p>Click to edit</p>}
    </Tooltip>
  );
};

export const MagicNumber = ({
  tempId,
  result,
  loadingState = false,
  readOnly = false,
  isReference = true,
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
        <IntrospectMagicNumber
          isReference={isReference}
          expression={expression}
          readOnly={readOnly}
        >
          {hasResult ? (
            <span css={highlightStyles(isReference, readOnly)}>
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
