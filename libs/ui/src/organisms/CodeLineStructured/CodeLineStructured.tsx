import { Result } from '@decipad/computer';
import { useDelayedValue } from '@decipad/react-utils';
import React, { ComponentProps, ReactNode, useState } from 'react';
import { CodeError } from '../../atoms';
import { StructuredInputLines } from '../../molecules';
import { CodeResultProps } from '../../types';
import { useResultInfo } from '../CodeLine/CodeLine';
import {
  canGrabStyles,
  codeLineStyles,
  codeContainerStyles,
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
    <StructuredInputLines>
      <div
        css={[codeLineStyles, highlight && highlightedLineStyles]}
        spellCheck={false}
      >
        <code contentEditable={true} css={variableNameContainerStyles}>
          {variableNameChild}
        </code>
        <code contentEditable={true} css={codeContainerStyles}>
          {codeChild}
        </code>
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
      </div>
    </StructuredInputLines>
  );
};
