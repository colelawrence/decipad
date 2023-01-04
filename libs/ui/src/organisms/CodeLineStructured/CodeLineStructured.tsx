import { Result } from '@decipad/computer';
import { useDelayedValue } from '@decipad/react-utils';
import React, { ComponentProps, ReactNode, useState } from 'react';
import { CodeError } from '../../atoms';
import { CodeResultProps } from '../../types';
import { useResultInfo } from '../CodeLine/CodeLine';
import {
  borderStyles,
  canGrabStyles,
  codeLineStyles,
  codeContainerStyles,
  fadeLineStyles,
  grabbingStyles,
  highlightedLineStyles,
  inlineStyles,
  placeholderStyles,
  variableNameContainerStyles,
} from './styles';

interface CodeLineStructuredProps {
  readonly highlight?: boolean;
  readonly placeholder?: string;
  readonly result?: Result.Result;
  readonly syntaxError?: ComponentProps<typeof CodeError>;
  readonly isEmpty?: boolean;
  readonly onDragStartInlineResult?: (e: React.DragEvent) => void;
  readonly onDragStartCell?: CodeResultProps<'table'>['onDragStartCell'];
  readonly onClickedResult?: (arg0: Result.Result) => void;
  readonly hasNextSibling?: boolean;
  readonly variableNameChild: ReactNode;
  readonly codeChild: ReactNode;
}

export const CodeLineStructured = ({
  highlight = false,
  result,
  placeholder,
  syntaxError,
  isEmpty = false,
  onDragStartInlineResult,
  onDragStartCell,
  onClickedResult,
  hasNextSibling,
  variableNameChild,
  codeChild,
}: CodeLineStructuredProps): ReturnType<React.FC> => {
  const [grabbing, setGrabbing] = useState(false);

  const freshResult = useResultInfo({
    result,
    syntaxError,
    onDragStartCell,
    onClickedResult,
  });
  const { inline, expanded } = useDelayedValue(
    freshResult,
    freshResult.errored === true
  );

  return (
    <div
      css={[codeLineStyles, highlight && highlightedLineStyles]}
      spellCheck={false}
    >
      <code css={variableNameContainerStyles}>{variableNameChild}</code>
      <code css={codeContainerStyles}>{codeChild}</code>
      {placeholder && isEmpty && (
        <span css={placeholderStyles} contentEditable={false}>
          {placeholder}
        </span>
      )}
      {!isEmpty && (
        <div
          css={[
            inlineStyles,
            (onDragStartInlineResult || onDragStartCell || onClickedResult) &&
              canGrabStyles,
            grabbing && grabbingStyles,
          ]}
          contentEditable={false}
          draggable
          onDragStart={(e) => {
            onDragStartInlineResult?.(e);
            setGrabbing(true);
          }}
          onDragEnd={() => setGrabbing(false)}
        >
          {inline}
        </div>
      )}
      {!isEmpty && expanded}

      {/* The following spans are used to draw the borders of the code line.
          They are positioned absolutely */}
      <span css={fadeLineStyles('top', 'left')}></span>
      <span css={borderStyles('top')}></span>
      <span css={fadeLineStyles('top', 'right')}></span>

      {!hasNextSibling && (
        <>
          <span css={fadeLineStyles('bot', 'left')}></span>
          <span css={borderStyles('bot')}></span>
          <span css={fadeLineStyles('bot', 'right')}></span>
        </>
      )}
    </div>
  );
};
