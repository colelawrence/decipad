import { Prettify } from '@decipad/utils';
import { p12Regular, p14Medium } from '../../../primitives';
import { FC, ReactNode, useState } from 'react';
import { Button } from '../../../shared';
import {
  IntegrationItemStyled,
  IntegrationItemIconWrapper,
  IntegrationItemTextAndActions,
  IntegrationActionItemStyled,
  IntegrationDeleteText,
  IntegrationItemIconDisabledWrapper,
  IntegrationItemDisabledTextAndActions,
  IntegrationSoonTag,
  IntegrationButton,
} from './styles';

type IntegrationItemProps = Readonly<{
  icon: ReactNode;
  title: string;
  description: string;

  onClick: () => void;

  testId?: string;
}>;

export const IntegrationItem: FC<IntegrationItemProps> = ({
  icon,
  title,
  description,
  onClick,
  testId,
}) => (
  <div css={IntegrationItemStyled}>
    <div css={IntegrationItemIconWrapper}>{icon}</div>
    <div css={IntegrationItemTextAndActions}>
      <div>
        <p css={p14Medium}>{title}</p>
        {description.length > 0 && <p css={p12Regular}>{description}</p>}
      </div>
    </div>
    <div css={IntegrationButton}>
      <Button type="secondary" onClick={onClick} testId={testId}>
        Connect
      </Button>
    </div>
  </div>
);

type IntegrationActionItemProps = Prettify<
  IntegrationItemProps & {
    onEdit: (() => void) | undefined;
    onDelete: () => void;
  }
>;

export const IntegrationActionItem: FC<IntegrationActionItemProps> = ({
  icon,
  title,
  description,
  testId,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const onConfirmDelete = () => {
    setIsDeleting(false);

    onDelete();
  };

  if (isDeleting) {
    return (
      <div css={IntegrationActionItemStyled} data-testid={testId}>
        <div css={IntegrationItemIconWrapper}>{icon}</div>
        <div css={IntegrationItemTextAndActions}>
          <div>
            <p css={p14Medium}>{title}</p>
            <p css={p12Regular}>{description}</p>
          </div>
          <div css={IntegrationButton}>
            <span css={IntegrationDeleteText}>
              Notebooks with this connection could break
            </span>
            <Button type="secondary" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button type="danger" onClick={onConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div css={IntegrationActionItemStyled} data-testid={testId}>
      <div css={IntegrationItemIconWrapper}>{icon}</div>
      <div css={IntegrationItemTextAndActions}>
        <div>
          <p css={p14Medium}>{title}</p>
          {description.length > 0 && <p css={p12Regular}>{description}</p>}
        </div>
        <div css={IntegrationButton}>
          {onEdit != null && (
            <Button type="secondary" onClick={onEdit}>
              Edit
            </Button>
          )}
          <Button type="secondary" onClick={() => setIsDeleting(true)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export const IntegrationDisabledItem: FC<IntegrationItemProps> = ({
  icon,
  title,
  description,
  testId,
}) => (
  <div css={IntegrationActionItemStyled} data-testid={testId}>
    <div css={IntegrationItemIconDisabledWrapper}>{icon}</div>
    <div css={IntegrationItemDisabledTextAndActions}>
      <div>
        <p css={p14Medium}>
          {title} <span css={IntegrationSoonTag}>SOON</span>
        </p>
        <p css={p12Regular}>{description}</p>
      </div>
    </div>
  </div>
);
