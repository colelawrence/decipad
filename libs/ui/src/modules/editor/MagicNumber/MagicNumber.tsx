/* eslint decipad/css-prop-named-variable: 0 */
import type { Result } from '@decipad/language-interfaces';
import { AnyElement } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';

import { CodeResult } from '../CodeResult/CodeResult';
import { cssVar } from '../../../primitives';
import {
  resultBubbleStyles,
  resultLoadingIconStyles,
} from '../../../styles/results';
import { useEventNoEffect } from '../../../utils/useEventNoEffect';
import { Loading, Tooltip } from '../../../shared';

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
      padding: '1px 6px 0px 6px',
      lineHeight: '1.3',
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
      <span title={resultToSmallString(result?.value)} contentEditable={false}>
        <IntrospectMagicNumber
          isReference={isReference}
          expression={expression}
          readOnly={readOnly}
        >
          {hasResult ? (
            <span
              css={[
                highlightStyles(isReference, readOnly),
                { color: cssVar('themeTextSubdued') },
              ]}
              data-testid={`code-result:${resultToSmallString(result?.value)}`}
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
