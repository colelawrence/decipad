import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { componentCssVars, p13Regular, p14Medium } from '../../../primitives';
import { Button } from '../Button/Button';

interface UpgradePlanWarningTooltipProps {
  readonly quotaLimit?: number;
  readonly workspaceId?: string;
  readonly maxQueryExecution?: boolean;
  readonly showQueryQuotaLimit?: boolean;
  readonly featureCustomText?: string;
  readonly showUpgradeProButton?: boolean;
}
export const UpgradePlanWarningTooltip = ({
  quotaLimit,
  workspaceId,
  maxQueryExecution = false,
  showQueryQuotaLimit = false,
  featureCustomText = '',
  showUpgradeProButton = true,
}: UpgradePlanWarningTooltipProps): ReturnType<React.FC> => {
  const navigate = useNavigate();

  return (
    <>
      {maxQueryExecution && (
        <>
          <p css={tooltipTitle}>{featureCustomText}</p>
          <p css={tooltipContent}>
            You have used all of your {quotaLimit} credits.{<br />}
          </p>
        </>
      )}
      {showQueryQuotaLimit && (
        <>
          <p css={tooltipTitle}>{featureCustomText}</p>
          <p css={tooltipContent}>
            You are about to reach the limit of {quotaLimit} credits.
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
                navigate(
                  workspaces({})
                    .workspace({
                      workspaceId,
                    })
                    .members({}).$,
                  { replace: true }
                );
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
