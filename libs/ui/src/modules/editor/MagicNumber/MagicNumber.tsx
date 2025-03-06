/* eslint decipad/css-prop-named-variable: 0 */
import type { Result } from '@decipad/language-interfaces';
import { AnyElement } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode, useMemo } from 'react';

import { CodeResult } from '../CodeResult/CodeResult';
import { cssVar } from '../../../primitives';
import { resultLoadingIconStyles } from '../../../styles/results';
import { useEventNoEffect } from '../../../utils/useEventNoEffect';
import { Loading, Tooltip } from '../../../shared';

export type MagicNumberProps = {
  readonly tempId?: string;
  readonly result?: Result.Result | undefined;
  readonly loadingState?: boolean;
  readOnly?: boolean;
  readonly onClick?: () => void;
  readonly onGoToDefinition?: () => void;
  readonly setPointyStyles?: boolean;
  readonly expression?: string;
  readonly element?: AnyElement;
  /** Is this magic number pointing to an expression reference? */
  readonly isReference?: boolean;
};

const wrapperStyles = css({
  display: 'inline-flex',
});

const clickableStyles = css({
  cursor: 'pointer',
});

const highlightStyles = (isReference: boolean, readOnly: boolean) =>
  css([
    {
      display: 'inline-block',
      textDecoration: 'underline',
      textDecorationStyle: 'dotted',
      textDecorationThickness: '1.3px',
      textDecorationColor: 'color-mix(in srgb, currentColor 33%, transparent)',
      textUnderlineOffset: '5px',
      '@media print': {
        color: 'unset',
      },
    },
    !isReference && {
      color: cssVar('textDefault'),
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
  onGoToDefinition?: () => void;
}

const IntrospectMagicNumber: FC<ResultResultProps> = ({
  isReference,
  readOnly,
  children,
  onGoToDefinition = noop,
}) => {
  if (!isReference && readOnly) {
    return <span>{children}</span>;
  }
  return (
    <Tooltip trigger={<span>{children}</span>}>
      <p onClick={onGoToDefinition} css={clickableStyles}>
        Definition &rarr;
      </p>
    </Tooltip>
  );
};

const resultToSmallString = (result?: Result.OneResult | null): string => {
  return result != null
    ? typeof result !== 'symbol' && !Array.isArray(result)
      ? result.toString()
      : (Array.isArray(result) && result.map(resultToSmallString).join(',')) ||
        'result'
    : 'Loading';
};

export const MagicNumber = ({
  tempId,
  result,
  loadingState = false,
  readOnly = false,
  isReference = true,
  onClick = noop,
  onGoToDefinition = noop,
  expression,
  element,
}: MagicNumberProps): ReturnType<React.FC> => {
  const hasResult = !!result && !loadingState;
  const noEffectOnClick = useEventNoEffect(onClick);
  const resultSmallString = useMemo(
    () => resultToSmallString(result?.value),
    [result]
  );

  return (
    <span
      onClick={readOnly ? noop : noEffectOnClick}
      css={[wrapperStyles, clickableStyles]}
      data-number-id={tempId}
      id={tempId}
      data-testid="magic-number"
    >
      <span title={resultSmallString} contentEditable={false}>
        <IntrospectMagicNumber
          isReference={isReference}
          expression={expression}
          readOnly={readOnly}
          onGoToDefinition={onGoToDefinition}
        >
          {hasResult ? (
            <span
              css={[
                highlightStyles(isReference, readOnly),
                { color: cssVar('themeTextSubdued') },
              ]}
              data-testid={`code-result:${resultSmallString}`}
            >
              <CodeResult
                expanded
                tooltip={false}
                variant="inline"
                {...result}
                blockId={tempId}
                element={element}
              />
            </span>
          ) : (
            <span css={resultLoadingIconStyles}>
              <Loading />
            </span>
          )}
        </IntrospectMagicNumber>
      </span>
    </span>
  );
};
