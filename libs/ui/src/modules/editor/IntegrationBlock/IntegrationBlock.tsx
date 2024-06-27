/* eslint decipad/css-prop-named-variable: 0 */
import { MarkType } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import type { Result } from '@decipad/language-interfaces';
import { css } from '@emotion/react';
import { ComponentProps, FC, ReactNode } from 'react';
import { cssVar, p12Medium } from '../../../primitives';
import { SegmentButtons, TextAndIconButton } from '../../../shared';
import {
  hideOnPrint,
  integrationBlockStyles,
} from '../../../styles/editor-layout';
import { Height } from '../../../styles/spacings';
import { CodeResult } from '../CodeResult/CodeResult';
import { CreateChartMenu } from '../CreateChartMenu/CreateChartMenu';
import { LiveCode } from '../LiveCode/LiveCode';

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
  displayResults,
  result,
}) => {
  const readOnly = useIsEditorReadOnly();

  return (
    <div
      className={'block-table'}
      css={integrationBlockStyles}
      data-testid={'integration-block'}
    >
      <div css={css(hideOnPrint, { display: 'flex', alignItems: 'center' })}>
        <LiveCode
          meta={meta}
          error={typeof error === 'string' ? new Error(error) : undefined}
          type={result?.type.kind}
          text={text}
        >
          {children}
        </LiveCode>

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
          <SegmentButtons
            buttons={buttons}
            variant="default"
            border
            padding="skinny"
            iconSize="integrations"
          />
        </div>
      </div>

      <div contentEditable={false}>
        {displayResults && result && (
          <CodeResult value={result.value} type={result.type} isLiveResult />
        )}
      </div>
    </div>
  );
};

const controlStyles = css(p12Medium, hideOnPrint, {
  // Shifts whole div to the right.
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  gap: '6px',
  color: cssVar('textDefault'),
  height: Height.Bubble,
});
