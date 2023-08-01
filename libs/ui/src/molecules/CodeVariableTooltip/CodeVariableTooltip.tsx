import { useComputer } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Tooltip } from '../../atoms';
import { CodeResult } from '../../organisms';
import { componentCssVars, p8Regular } from '../../primitives';

const goToDefStyles = css(p8Regular, {
  color: componentCssVars('TooltipText'),
});

interface CodeVariableTooltipProps {
  variableMissing?: boolean;
  children: ReactNode;
  defBlockId?: string | null;
  provideDefinitionLink: boolean;
}

const tooltipDebounceMs = 500;

export const CodeVariableTooltip: FC<CodeVariableTooltipProps> = ({
  variableMissing = false,
  children,
  defBlockId,
  provideDefinitionLink,
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
    <a
      css={goToDefStyles}
      href={`#${defBlockId}`}
      onClick={(ev) => {
        ev.preventDefault();
        window.history.pushState(null, '', `#${defBlockId}`);
        window.dispatchEvent(new Event('hashchange'));
      }}
    >
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
