import { css } from '@emotion/react';
import { Button } from '../Button/Button';
import { cssVar, p13Medium, p13Regular, p14Medium } from '../../../primitives';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';

interface UpgradePlanWarningProps {
  readonly quotaLimit: number;
  readonly workspaceId: string;
  readonly maxQueryExecution?: boolean;
  readonly showQueryQuotaLimit?: boolean;
  readonly noun?: string;
}
export const UpgradePlanWarning = ({
  quotaLimit,
  workspaceId,
  maxQueryExecution = false,
  showQueryQuotaLimit = false,
  noun = 'credits',
}: UpgradePlanWarningProps): ReturnType<React.FC> => {
  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();

  return (
    <div css={upgradeProStyles} contentEditable={false}>
      <div>
        {maxQueryExecution && (
          <>
            <p css={p14Medium}>
              You have used all of your {quotaLimit} {noun}.
            </p>
            <p css={p13Regular}>Upgrade workspace to bypass this limitation.</p>
          </>
        )}
        {showQueryQuotaLimit && (
          <>
            <p css={p14Medium}>
              You are about to reach the limit of {quotaLimit} {noun}.{<br />}
            </p>
            <p css={p13Regular}>Upgrade workspace to bypass this limitation.</p>
          </>
        )}
      </div>
      <div>
        <Button
          type="primaryBrand"
          size="extraSlim"
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
