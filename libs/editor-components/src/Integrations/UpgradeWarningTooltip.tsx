import {
  type SingleResourceUsage,
  useResourceUsage,
} from '@decipad/react-contexts';
import { UpgradePlanWarning, UpgradePlanWarningTooltip } from '@decipad/ui';
import type { FC, ReactNode } from 'react';

type VariantUpgradeTypes =
  | {
      variant: 'tooltip';
      featureText: string;
    }
  | {
      variant: 'block';
      workspaceId: string;
    };

type UpgradeWarningProps =
  | {
      fallback?: ReactNode;
    } & VariantUpgradeTypes;

type UpgradeWarningFullProps = UpgradeWarningProps & {
  resourceTracker: SingleResourceUsage;
};

type GeneralUpgradeWarningProps = UpgradeWarningProps & {
  type: 'queries' | 'ai';
};

const ConcreteUpgradeWarning: FC<UpgradeWarningFullProps> = (props) => {
  if (props.resourceTracker.hasReachedLimit) {
    if (props.variant === 'tooltip') {
      return (
        <UpgradePlanWarningTooltip
          featureCustomText={props.featureText}
          quotaLimit={props.resourceTracker.quotaLimit}
          maxQueryExecution
          showUpgradeProButton
        />
      );
    }

    return (
      <UpgradePlanWarning
        workspaceId={props.workspaceId}
        quotaLimit={props.resourceTracker.quotaLimit}
        maxQueryExecution
      />
    );
  }

  if (props.resourceTracker.isNearLimit) {
    if (props.variant === 'tooltip') {
      return (
        <UpgradePlanWarningTooltip
          featureCustomText={props.featureText}
          quotaLimit={props.resourceTracker.quotaLimit}
          showQueryQuotaLimit
        />
      );
    }

    return (
      <UpgradePlanWarning
        workspaceId={props.workspaceId}
        quotaLimit={props.resourceTracker.quotaLimit}
        showQueryQuotaLimit
      />
    );
  }

  if (props.fallback == null) {
    return null;
  }

  return <>{props.fallback}</>;
};

const UpgradeWarningQueries: FC<UpgradeWarningProps> = (props) => {
  const { queries } = useResourceUsage();

  return <ConcreteUpgradeWarning {...props} resourceTracker={queries} />;
};

const UpgradeWarningAi: FC<UpgradeWarningProps> = (props) => {
  const { ai } = useResourceUsage();

  return <ConcreteUpgradeWarning {...props} resourceTracker={ai} />;
};

export const UpgradeWarningBlock: FC<GeneralUpgradeWarningProps> = ({
  type,
  ...rest
}) => {
  switch (type) {
    case 'queries':
      return <UpgradeWarningQueries {...rest} />;
    case 'ai':
      return <UpgradeWarningAi {...rest} />;
  }
};
