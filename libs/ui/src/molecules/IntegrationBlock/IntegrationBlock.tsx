/* eslint decipad/css-prop-named-variable: 0 */
import { SimpleTableCellType } from '@decipad/editor-types';
import { Result } from '@decipad/language';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode } from 'react';
import { LiveCode, SegmentButtons, TextAndIconButton } from '../../atoms';
import { CodeResult } from '../../organisms';
import { MarkType } from '../../organisms/PlotParams/PlotParams';
import { cssVar, p12Medium } from '../../primitives';
import {
  hideOnPrint,
  integrationBlockStyles,
} from '../../styles/editor-layout';
import { CreateChartMenu } from '../CreateChartMenu/CreateChartMenu';

type IntegrationButton =
  | {
      readonly type: 'button';
      readonly onClick: () => void;
      readonly text: string;
      readonly icon?: ReactNode;
    }
  | {
      readonly type: 'chart';
      readonly onClick: (mark: MarkType) => void;
    };

type IntegrationBlockProps = {
  readonly children: ReactNode;
  readonly actionButtons?: IntegrationButton[];
  readonly displayResults: boolean;
  readonly error?: string;
  readonly result?: Result.Result;
  readonly integrationChildren?: ReactNode;
  readonly firstTableRowControls?: ReactNode;
  readonly onChangeColumnType: (
    columnIndex: number,
    colType?: SimpleTableCellType
  ) => void;
} & LiveCodePartialProps &
  SegmentButtonsProps;

type LiveCodePartialProps = Pick<
  ComponentProps<typeof LiveCode>,
  'type' | 'text' | 'meta'
>;

type SegmentButtonsProps = Pick<
  ComponentProps<typeof SegmentButtons>,
  'buttons'
>;

export const IntegrationBlock: FC<IntegrationBlockProps> = ({
  children,
  meta,
  integrationChildren,
  type,
  error,
  text,
  buttons,
  actionButtons = [],
  displayResults,
  result,
  firstTableRowControls,
  onChangeColumnType,
}) => {
  const readOnly = useIsEditorReadOnly();

  return (
    <div css={integrationBlockStyles}>
      <div css={css({ display: 'flex', alignItems: 'center' })}>
        <LiveCode
          meta={meta}
          error={typeof error === 'string' ? new Error(error) : undefined}
          type={type}
          text={text}
        >
          {children}
        </LiveCode>
        <div contentEditable={false}>{integrationChildren}</div>

        <div contentEditable={false} css={controlStyles}>
          {readOnly || actionButtons.length === 0 ? (
            <div css={{ visibility: 'hidden' }} />
          ) : (
            actionButtons.map((button, i) => {
              return button.type === 'chart' ? (
                <CreateChartMenu
                  key={`create-chart-button-integration-block-${i}`}
                  onAddChartViewButtonPress={button.onClick}
                />
              ) : (
                <TextAndIconButton
                  key={button.text}
                  text={button.text}
                  iconPosition="left"
                  onClick={button.onClick}
                >
                  {button.icon}
                </TextAndIconButton>
              );
            })
          )}
          <SegmentButtons buttons={buttons} />
        </div>
      </div>

      <div contentEditable={false}>
        {displayResults && result && (
          <CodeResult
            value={result.value}
            type={result.type}
            onChangeColumnType={onChangeColumnType}
            isLiveResult
            firstTableRowControls={firstTableRowControls}
          />
        )}
      </div>
    </div>
  );
};

const controlStyles = css(p12Medium, hideOnPrint, {
  // Shifts whole div to the right.
  marginLeft: 'auto',
  display: 'flex',
  cursor: 'pointer',
  gap: '6px',
  color: cssVar('normalTextColor'),
});
