/* eslint decipad/css-prop-named-variable: 0 */
import { MarkType } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import type { Result } from '@decipad/language-interfaces';
import { ComponentProps, FC, ReactNode } from 'react';
import { cssVar, gridShiftScreenQuery, p12Medium } from '../../../primitives';
import { SegmentButtons, TextAndIconButton } from '../../../shared';
import { hideOnPrint } from '../../../styles/editor-layout';
import { Height } from '../../../styles/spacings';
import { CreateChartMenu } from '../CreateChartMenu/CreateChartMenu';
import { LiveCode } from '../LiveCode/LiveCode';
import styled from '@emotion/styled';

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
  readonly error?: string;
  readonly result?: Result.Result;
  readonly resultPreview: ReactNode;
  readonly formulas: ReactNode;
} & LiveCodePartialProps &
  SegmentButtonsProps;

type LiveCodePartialProps = Pick<
  ComponentProps<typeof LiveCode>,
  'text' | 'meta'
>;

type SegmentButtonsProps = Pick<
  ComponentProps<typeof SegmentButtons>,
  'buttons'
>;

export const IntegrationBlock: FC<IntegrationBlockProps> = ({
  children,
  meta,
  error,
  text,
  buttons,
  actionButtons = [],
  result,
  resultPreview,
  formulas,
}) => {
  const readOnly = useIsEditorReadOnly();

  return (
    <>
      <CaptionWrapper>
        <LiveCode
          meta={meta}
          error={typeof error === 'string' ? new Error(error) : undefined}
          type={result?.type.kind}
          text={text}
        >
          {children}
        </LiveCode>

        <ControlButtonsDiv contentEditable={false}>
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
          <SegmentButtons
            buttons={buttons}
            variant="default"
            border
            padding="skinny"
            iconSize="integrations"
          />
        </ControlButtonsDiv>
      </CaptionWrapper>

      {formulas}

      <ResultPreviewWrapper contentEditable={false}>
        {resultPreview}
      </ResultPreviewWrapper>
    </>
  );
};

const ControlButtonsDiv = styled.div(p12Medium, hideOnPrint, {
  // Shifts whole div to the right.
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  gap: '6px',
  color: cssVar('textDefault'),
  height: Height.Bubble,
});

const CaptionWrapper = styled.div({
  gridColumn: '3 / span 1',
  display: 'flex',
  alignItems: 'center',

  [gridShiftScreenQuery]: {
    gridColumn: '2 / span 1',
  },
});

const ResultPreviewWrapper = styled.div({
  gridColumn: '1 / span 5',
});
