import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { useComputer } from '@decipad/react-contexts';
import { Tooltip } from '../../atoms';
import { p8Regular } from '../../primitives';
import { CodeResult } from '../../organisms';

const goToDefStyles = css(p8Regular);

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
  onGoToDefinition = noop,
}) => {
  const hasValue = useComputer().getBlockIdResult$.useWithSelectorDebounced(
    tooltipDebounceMs,
    (result) => result?.result != null,
    defBlockId
  );

  const tooltipResult = hasValue && (
    <TooltipResult defBlockId={defBlockId ?? ''} />
  );
  const goToDefinition = provideDefinitionLink && defBlockId && (
    <a css={goToDefStyles} href={`#${defBlockId}`} onClick={onGoToDefinition}>
      Go to definition &rarr;
    </a>
  );

  const enableTooltip = !variableMissing && (tooltipResult || goToDefinition);

  return (
    <Tooltip
      trigger={<span>{children}</span>}
      open={enableTooltip ? undefined : false}
    >
      {tooltipResult}
      {goToDefinition}
    </Tooltip>
  );
};

/**
 * Subscribes to the result in the tooltip. This separation prevents updates to the
 * tooltip while it's closed, because a closed tooltip won't mount this component, and
 * therefore subscribe to computer results.
 */
const TooltipResult: FC<{ defBlockId: string }> = ({ defBlockId }) => {
  const { type, value } =
    useComputer().getBlockIdResult$.use(defBlockId)?.result ?? {};

  if (type == null || value == null) {
    return <></>;
  }
  return (
    <CodeResult type={type} value={value} variant="inline" tooltip={false} />
  );
};
