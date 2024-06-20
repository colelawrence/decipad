import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { componentCssVars, p13Regular, p14Medium } from '../../../primitives';
import { Button } from '../Button/Button';

interface UpgradePlanWarningTooltipProps {
  readonly quotaLimit?: number;
  readonly workspaceId?: string;
  readonly maxQueryExecution?: boolean;
  readonly showQueryQuotaLimit?: boolean;
  readonly featureCustomText?: string;
  readonly showUpgradeProButton?: boolean;
  readonly noun?: string;
}
export const UpgradePlanWarningTooltip = ({
  quotaLimit,
  workspaceId,
  maxQueryExecution = false,
  showQueryQuotaLimit = false,
  featureCustomText = '',
  noun = 'credits',
  showUpgradeProButton = true,
}: UpgradePlanWarningTooltipProps): ReturnType<React.FC> => {
  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();

  return (
    <>
      {maxQueryExecution && (
        <>
          <p css={tooltipTitle}>{featureCustomText}</p>
          <p css={tooltipContent}>
            You have used all of your {quotaLimit} {noun}.{<br />}
          </p>
        </>
      )}
      {showQueryQuotaLimit && (
        <>
          <p css={tooltipTitle}>{featureCustomText}</p>
          <p css={tooltipContent}>
            You are about to reach the limit of {quotaLimit} {noun}.
          </p>
        </>
      )}
      {showUpgradeProButton && (
        <div>
          <Button
            type="primaryBrand"
            size="extraExtraSlim"
            onClick={() => {
              if (workspaceId) {
                setIsUpgradeWorkspaceModalOpen(true);
              }
            }}
            sameTab={true} // change this to false if you want to work on payments locally
            testId="integration_upgrade_pro"
          >
            Upgrade workspace
          </Button>
        </div>
      )}
    </>
  );
};

const tooltipTitle = css(p14Medium, {
  textAlign: 'center',
  color: componentCssVars('TooltipText'),
});

const tooltipContent = css(p13Regular, {
  color: componentCssVars('TooltipTextSecondary'),
});
