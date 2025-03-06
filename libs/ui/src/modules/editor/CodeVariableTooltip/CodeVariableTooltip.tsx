import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Tooltip } from '../../../shared';
import { CodeResult } from '../CodeResult/CodeResult';
import { componentCssVars, p12Regular } from '../../../primitives';
import { useComputer } from '@decipad/editor-hooks';
import { noop } from '@decipad/utils';

const goToDefStyles = css(p12Regular, {
  color: componentCssVars('TooltipText'),
  cursor: 'pointer',
});

interface CodeVariableTooltipProps {
  variableMissing?: boolean;
  children: ReactNode;
  defBlockId?: string | null;
  provideDefinitionLink: boolean;
  onGoToDefinition?: () => void;
}

const tooltipDebounceMs = 500;

export const CodeVariableTooltip: FC<CodeVariableTooltipProps> = ({
  variableMissing = false,
  children,
  defBlockId,
  provideDefinitionLink,
  onGoToDefinition: goToDefinition = noop,
}) => {
  const hasValue = useComputer().getBlockIdResult$.useWithSelectorDebounced(
    tooltipDebounceMs,
    (result) => result?.result != null,
    defBlockId
  );

  const tooltipResult = hasValue && (
    <TooltipResult defBlockId={defBlockId ?? ''} />
  );
  const goToDefinitionLink = provideDefinitionLink && defBlockId && (
    <a
      css={goToDefStyles}
      href={`#${defBlockId}`}
      onClick={(ev) => {
        ev.preventDefault();
        goToDefinition();
      }}
      data-testid="go-to-definition"
    >
      Definition &rarr;
    </a>
  );

  const enableTooltip =
    !variableMissing && (tooltipResult || goToDefinitionLink);

  return (
    <Tooltip
      trigger={<span>{children}</span>}
      open={enableTooltip ? undefined : false}
    >
      {tooltipResult}
      {goToDefinitionLink}
    </Tooltip>
  );
};

/**
 * Subscribes to the result in the tooltip. This separation prevents updates to the
 * tooltip while it's closed, because a closed tooltip won't mount this component, and
 * therefore subscribe to computer results.
 */
const TooltipResult: FC<{ defBlockId: string }> = ({ defBlockId }) => {
  const { type, value, meta } =
    useComputer().getBlockIdResult$.use(defBlockId)?.result ?? {};

  if (type == null || value == null) {
    return <></>;
  }
  return (
    <CodeResult
      type={type}
      value={value}
      meta={meta}
      variant="inline"
      tooltip={false}
    />
  );
};
