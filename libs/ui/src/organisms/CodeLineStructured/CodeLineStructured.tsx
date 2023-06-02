/* eslint decipad/css-prop-named-variable: 0 */
import { Result } from '@decipad/computer';
import { useDelayedValue } from '@decipad/react-utils';
import React, { ComponentProps, ReactNode, useState } from 'react';
import { CodeError } from '../../atoms';
import { StructuredInputLines } from '../../molecules';
import { grey400 } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { CodeResultProps } from '../../types';
import { useResultInfo } from '../CodeLine/CodeLine';
import { TableButton } from '../TableButton/TableButton';
import {
  canGrabStyles,
  codeContainerStyles,
  codeLineStyles,
  grabbingStyles,
  highlightedLineStyles,
  inlineStyles,
  variableNameContainerStyles,
} from './styles';

interface CodeLineStructuredProps {
  readonly highlight?: boolean;
  readonly result?: Result.Result;
  readonly syntaxError?: ComponentProps<typeof CodeError>;
  readonly onDragStartInlineResult?: (e: React.DragEvent) => void;
  readonly onDragStartCell?: CodeResultProps<'table'>['onDragStartCell'];
  readonly onDragEnd?: (e: React.DragEvent) => void;
  readonly onClickedResult?: (arg0: Result.Result) => void;
  readonly variableNameChild: ReactNode;
  readonly codeChild: ReactNode;
  readonly unitPicker: ReactNode;
  readonly readOnly?: boolean;
}

export const CodeLineStructured = ({
  highlight = false,
  result,
  syntaxError,
  onDragStartInlineResult,
  onDragStartCell,
  onDragEnd,
  onClickedResult,
  variableNameChild,
  codeChild,
  unitPicker,
  readOnly = false,
}: CodeLineStructuredProps): ReturnType<React.FC> => {
  const [grabbing, setGrabbing] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);

  const freshResult = useResultInfo({
    result,
    syntaxError,
    onDragStartCell,
    onClickedResult,
    variant: 'inline',
  });
  const { inline, expanded } = useDelayedValue(
    freshResult,
    freshResult.errored === true
  );

  /* Now, I know what you're thinking. A DIV inline?.
   * Slate, seems to allow inline elements (span, var), to be clicked (And therefore the selection changes).
   * but it doesn't do this for block elements like DIVs.
   * Hence why we have this, instead of a span.
   */
  const getEquals = () => {
    return (
      <div
        contentEditable={false}
        css={{
          color: grey400.rgb,
          display: 'inline',
          lineHeight: '24px',
          paddingLeft: '4px',
          userSelect: 'none',
        }}
      >
        =
      </div>
    );
  };

  return (
    <StructuredInputLines>
      <div
        css={[codeLineStyles, highlight && highlightedLineStyles]}
        spellCheck={false}
      >
        <code contentEditable={!readOnly} css={variableNameContainerStyles}>
          {variableNameChild}
          {getEquals()}
        </code>
        <code
          data-testid="codeline-code"
          contentEditable={!readOnly}
          css={codeContainerStyles}
        >
          {!inline && (
            <div
              css={[
                inlineStyles,
                { padding: 0 },
                {
                  '> *': {
                    paddingBottom: 0,
                  },
                },
                hideOnPrint,
              ]}
              contentEditable={false}
            >
              <TableButton
                setState={setShowExpanded}
                isInState={showExpanded}
                captions={['Show data', 'Hide data']}
                isExpandButton
              />
            </div>
          )}
          <div
            css={[
              inlineStyles,
              (onDragStartInlineResult || onDragStartCell || onClickedResult) &&
                canGrabStyles,
              grabbing && grabbingStyles,
            ]}
            data-testid="code-line-result"
            contentEditable={false}
            draggable
            onDragStart={(e) => {
              onDragStartInlineResult?.(e);
              setGrabbing(true);
            }}
            onDragEnd={(e) => {
              onDragEnd?.(e);
              setGrabbing(false);
            }}
          >
            {inline}
          </div>
          {codeChild}
          {unitPicker}
        </code>
      </div>
      {showExpanded && <div css={showExpanded}>{expanded}</div>}
    </StructuredInputLines>
  );
};
