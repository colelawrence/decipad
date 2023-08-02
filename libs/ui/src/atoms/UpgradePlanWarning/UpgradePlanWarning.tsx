import { css } from '@emotion/react';
import { workspaces } from '@decipad/routing';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { cssVar, p13Medium, p13Regular, p14Medium } from '../../primitives';

interface UpgradePlanWarningProps {
  readonly quotaLimit: number;
  readonly workspaceId: string;
  readonly maxQueryExecution?: boolean;
  readonly showQueryQuotaLimit?: boolean;
}
export const UpgradePlanWarning = ({
  quotaLimit,
  workspaceId,
  maxQueryExecution = false,
  showQueryQuotaLimit = false,
}: UpgradePlanWarningProps): ReturnType<React.FC> => {
  const navigate = useNavigate();

  return (
    <div css={upgradeProStyles} contentEditable={false}>
      <div>
        {maxQueryExecution && (
          <>
            <p css={p14Medium}>
              You have used all of your {quotaLimit} credits.
            </p>
            <p css={p13Regular}>Upgrade to Pro to bypass this limitation.</p>
          </>
        )}
        {showQueryQuotaLimit && (
          <>
            <p css={p14Medium}>
              You are about to reach the limit of {quotaLimit} credits.{<br />}
            </p>
            <p css={p13Regular}>Upgrade to Pro to bypass this limitation.</p>
          </>
        )}
      </div>
      <div>
        <Button
          type="primaryBrand"
          size="extraSlim"
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
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
};

const upgradeProStyles = css(p13Medium, {
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: '6px',
  padding: '12px 16px',
  display: 'flex',
  width: '100%',
  gap: '20px',
  justifyContent: 'space-between',
  alignItems: 'center',
});
